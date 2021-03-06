<template>
    <el-container>
        <el-header class="search-bar">
            <h2 class="header"><code>rustup</code>组件历史状态表</h2>
            <el-form ref="searchFormRef" inline size="mini" :rules="searchForm.rules" :model="searchForm" class="search-form">
                <el-form-item label="发布频道" prop="channel">
                    <el-select v-model="searchForm.channel" allow-create filterable placeholder="请输入内容" class="channel-input">
                        <el-option v-for="item in searchForm.channelCandidates" :key="item" :label="item" :value="item" />
                    </el-select>
                </el-form-item>
                <el-form-item label="目标平台" prop="target">
                    <el-select v-model="searchForm.target" filterable placeholder="请选择" class="target-input">
                        <el-option v-for="item in searchForm.targetCandidates" :key="item" :label="item" :value="item" />
                    </el-select>
                </el-form-item>
                <el-form-item label="发布时间" prop="dateRange" class="date-range-input">
                    <el-date-picker :clearable="false" v-model="searchForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click.prevent.stop="onClick">查询</el-button>
                </el-form-item>
            </el-form>
            <div v-if="searchForm.selectedDate">
                <label>安装指令：</label>
                <ul>
                    <li><code>rustup toolchain install --profile complete {{searchForm.channel}}-{{searchForm.selectedDate}}-{{searchForm.target}}</code></li>
                    <li><code>rustup toolchain install --profile default {{searchForm.channel}}-{{searchForm.selectedDate}}-{{searchForm.target}}</code></li>
                    <li><code>rustup toolchain install --profile minimal {{searchForm.channel}}-{{searchForm.selectedDate}}-{{searchForm.target}}</code></li>
                </ul>
            </div>
        </el-header>
        <el-main class="search-result">
            <el-table height="100%" v-loading="searchResult.loading" :element-loading-text="searchResult.progress" :data="searchResult.data" border :header-cell-class-name="headCellClass" @header-click="onTableHeadClick">
                <el-table-column fixed prop="name" label="组件" width="115" v-if="searchResult.data.length > 0" />
                <el-table-column fixed prop="lastAvailableDisplay" label="最后发布时间" width="110" v-if="searchResult.data.length > 0" />
                <el-table-column width="100" v-for="col of searchResult.columns" :key="col.label" :prop="col.label" :label="col.label" align="center">
                    <template slot-scope="{row, column}">
                        <i class="el-icon-check" v-if="row[column.label] === CHECKED" />
                        <i class="el-icon-close" v-else />
                    </template>
                </el-table-column>
            </el-table>
        </el-main>
    </el-container>
</template>
<script lang="ts">
import {defineComponent, getCurrentInstance, reactive, ref} from '@vue/composition-api';
import moment from 'moment';
import pcLog from 'mx-general.macros/dist/log-sync.macro';
import _ from 'underscore';
export default defineComponent({
    name: 'Main',
    setup(props, context){ // eslint-disable-line max-lines-per-function
        const vm = getCurrentInstance();
        const axios = vm?.$axios;
        const searchFormRef = ref();
        const endDate = moment();
        const startDate = endDate.clone().subtract(7, 'days');
        const searchForm = reactive({
            dateRange: [startDate.toDate(), endDate.toDate()],
            selectedDate: null,
            channel: 'nightly',
            channelCandidates: CHANNELS,
            target: 'x86_64-pc-windows-gnu',
            targetCandidates: TARGETS,
            rules: {
                channel: [{
                    required: true,
                    message: '频道不能是空',
                    trigger: 'blur'
                }, {
                    trigger: 'blur',
                    validator(rule: unknown, value: string, callback: (err?: Error) => void){
                        if (~CHANNELS.indexOf(value) || /^(\d+\.)+(\d+)$/u.test(value)) {
                            return callback();
                        }
                        return callback(new Error('频道格式不正确'));
                    }
                }],
                target: [{
                    required: true,
                    message: '目标不能是空',
                    trigger: 'blur'
                }],
                dateRange: [{
                    required: true,
                    trigger: 'blur',
                    validator(rule: unknown, value: unknown[], callback: (err?: Error) => void){
                        if (value.every(date => date instanceof Date)) {
                            return callback();
                        }
                        return callback(new Error('发布时间范围不能是空'));
                    }
                }]
            }
        });
        const searchResult = reactive({
            progress: '',
            loading: false,
            columns: [],
            data: []
        });
        return {
            searchFormRef,
            searchForm,
            searchResult,
            CHECKED: COMPONENT_CHECK.YES,
            headCellClass({column, columnIndex}){
                if (columnIndex > 1 && searchResult.columns.length > 0 && searchResult.data.length > 0) {
                    const status = searchResult.data.map(cell => cell[column.label]);
                    if (status.every(s => s === COMPONENT_CHECK.YES)) {
                        return 'preferable-build';
                    }
                    if (status.every(s => s === COMPONENT_CHECK.NO)) {
                        return 'nullified-build';
                    }
                    return 'imperfect-build';
                }
                return '';
            },
            async onClick(){
                if (searchResult.loading) {
                    return;
                }
                await new Promise<void>((resolve, reject) => {
                    searchFormRef.value.validate((valid: boolean) => {
                        if (valid) {
                            resolve();
                        } else {
                            reject(new Error('表单验证失败'));
                        }
                    });
                });
                try {
                    searchResult.loading = true;
                    searchForm.selectedDate = null;
                    searchResult.data.length = searchResult.columns.length = 0;
                    searchResult.progress = '拼命加载中';
                    const [startMom, endMom] = searchForm.dateRange.map(date => moment(date));
                    const totalDays = endMom.diff(startMom, 'days');
                    let finisedDays = 0;
                    const days = [];
                    const components = new Set();
                    const promises = [];
                    while (startMom.isSameOrBefore(endMom)) {
                        const date = startMom.format('YYYY-MM-DD');
                        promises.push(requestSingleDay(date).then(dayItems => { // eslint-disable-line no-loop-func
                            const compItems = _.groupBy(dayItems, 'component');
                            const compNames = Object.keys(compItems);
                            compNames.forEach(compName => components.add(compName));
                            days.push({
                                date,
                                compNames,
                                compItems
                            });
                            finisedDays += 1;
                            searchResult.progress = `拼命加载中，完成 ${Math.min(Math.floor(finisedDays / totalDays * 100), 98)}%`;
                        }));
                        startMom.add(1, 'days');
                    }
                    await Promise.all(promises);
                    days.sort((a, b) => {
                        const aa = moment(a.date, 'YYYY-MM-DD');
                        const bb = moment(b.date, 'YYYY-MM-DD');
                        if (aa.isBefore(bb)) {
                            return -1;
                        }
                        if (aa.isAfter(bb)) {
                            return 1;
                        }
                        return 0;
                    });
                    searchResult.columns = days.map(day => ({
                        label: day.date
                    }));
                    components.forEach(compName => {
                        const row = {
                            name: compName
                        };
                        days.forEach(day => {
                            if (~day.compNames.indexOf(compName)) {
                                row[day.date] = COMPONENT_CHECK.YES;
                                const [{lastModified}] = day.compItems[compName];
                                if (row.lastAvailable == null) {
                                    row.lastAvailable = lastModified;
                                    row.lastAvailableDisplay = moment(lastModified, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-M-D');
                                } else {
                                    const c = moment(lastModified, 'YYYY-MM-DDTHH:mm:ss');
                                    const o = moment(row.lastAvailable, 'YYYY-MM-DDTHH:mm:ss');
                                    if (c.isAfter(o)) {
                                        row.lastAvailable = lastModified;
                                        row.lastAvailableDisplay = c.format('YYYY-M-D');
                                    }
                                }
                            } else {
                                row[day.date] = COMPONENT_CHECK.NO;
                            }
                        });
                        searchResult.data.push(row);
                    });
                    searchResult.progress = '拼命加载中，完成 100%';
                } finally {
                    setTimeout(() => {
                        searchResult.loading = false;
                    }, 500);
                }
            },
            onTableHeadClick(column, event){
                searchForm.selectedDate = column.label;
            }
        };
        function requestSingleDay(date: string){
            const postfix = `${searchForm.channel}-${searchForm.target}.tar.gz`;
            return request(date, '').then(result => result.filter(item => item.fileName.endsWith(postfix)).map(item => ({
                ...item,
                component: item.fileName.replace(`-${postfix}`, '')
            })));
            function request(date: string, marker: string, result = []){
                return axios.get(`${RUST_HOST}/`, {
                    params: {
                        prefix: `dist/${date}`,
                        marker
                    }
                }).then(response => handle(result, date, new DOMParser().parseFromString(response.data, 'text/xml')));
                function handle(result, date, data){
                    const root = data.documentElement;
                    let truncated = false;
                    let lastMarker;
                    for (const child of root.children) {
                        if (child.tagName === 'IsTruncated') {
                            truncated = child.textContent === 'true';
                        }
                        if (child.tagName !== 'Contents') {
                            continue;
                        }
                        let key = null;
                        let size = null;
                        let lastModified = null;
                        for (const node of child.children) {
                            if (node.tagName === 'Key') {
                                key = node;
                            }
                            if (node.tagName === 'LastModified') {
                                lastModified = node;
                            }
                            if (node.tagName === 'Size') {
                                size = node;
                            }
                        }
                        lastMarker = key.textContent;
                        result.push({
                            downloadUrl: `${RUST_HOST}/${key.textContent}`,
                            fileName: key.textContent.substr(Number(key.textContent.lastIndexOf('/')) + 1),
                            fileSize: renderFileSize(parseInt(size.textContent)),
                            lastModified: lastModified.textContent
                        });
                    }
                    if (truncated) {
                        return request(date, lastMarker, result);
                    }
                    return result;
                }
            }
        }
    }
});
function renderFileSize(n: number){
    if (n < 1024) {
        return `${renderTwo(n)} B`;
    }
    n = n / 1024;
    if (n < 1024) {
        return `${renderTwo(n)} KiB`;
    }
    n = n / 1024;
    if (n < 1024) {
        return `${renderTwo(n)} MiB`;
    }
    n = n / 1024;
    return `${renderTwo(n)} GiB`;
    function renderTwo(n: number){
        return Math.round(n * 100) / 100;
    }
}
const COMPONENT_CHECK = {YES: 'Y', NO: '-'};
const RUST_HOST = 'https://static.rust-lang.org';
const CHANNELS = ['stable', 'beta', 'nightly'];
const TARGETS = ['aarch64-unknown-linux-gnu', 'i686-pc-windows-gnu', 'i686-pc-windows-msvc', 'i686-unknown-linux-gnu', 'x86_64-apple-darwin', 'x86_64-pc-windows-gnu', 'x86_64-pc-windows-msvc', 'x86_64-unknown-linux-gnu', 'aarch64-apple-darwin', 'aarch64-apple-ios', 'aarch64-fuchsia', 'aarch64-linux-android', 'aarch64-pc-windows-msvc', 'aarch64-unknown-linux-musl', 'arm-linux-androideabi', 'arm-unknown-linux-gnueabi', 'arm-unknown-linux-gnueabihf', 'arm-unknown-linux-musleabi', 'arm-unknown-linux-musleabihf', 'armv5te-unknown-linux-gnueabi', 'armv7-linux-androideabi', 'armv7-unknown-linux-gnueabihf', 'armv7-unknown-linux-musleabihf', 'asmjs-unknown-emscripten', 'i586-pc-windows-msvc', 'i586-unknown-linux-gnu', 'i586-unknown-linux-musl', 'i686-linux-android', 'i686-unknown-freebsd', 'i686-unknown-linux-musl', 'mips-unknown-linux-gnu', 'mips-unknown-linux-musl', 'mips64-unknown-linux-gnuabi64', 'mips64el-unknown-linux-gnuabi64', 'mipsel-unknown-linux-gnu', 'mipsel-unknown-linux-musl', 'powerpc-unknown-linux-gnu', 'powerpc64-unknown-linux-gnu', 'powerpc64le-unknown-linux-gnu', 's390x-unknown-linux-gnu', 'sparc64-unknown-linux-gnu', 'sparcv9-sun-solaris', 'wasm32-unknown-emscripten', 'wasm32-unknown-unknown', 'wasm32-wasi', 'x86_64-apple-ios', 'x86_64-fuchsia', 'x86_64-linux-android', 'x86_64-unknown-freebsd', 'x86_64-unknown-illumos', 'x86_64-unknown-linux-gnux32', 'x86_64-unknown-linux-musl', 'x86_64-unknown-netbsd', 'x86_64-unknown-redox', 'thumbv6m-none-eabi', 'thumbv7em-none-eabi', 'thumbv7em-none-eabihf', 'thumbv7m-none-eabi', 'aarch64-unknown-none', 'aarch64-unknown-none-softfloat', 'armebv7r-none-eabi', 'armebv7r-none-eabihf', 'armv5te-unknown-linux-musleabi', 'armv7-unknown-linux-gnueabi', 'armv7-unknown-linux-musleabi', 'armv7a-none-eabi', 'armv7r-none-eabi', 'armv7r-none-eabihf', 'mips64-unknown-linux-muslabi64', 'mips64el-unknown-linux-muslabi64', 'nvptx64-nvidia-cuda', 'riscv32i-unknown-none-elf', 'riscv32imac-unknown-none-elf', 'riscv32imc-unknown-none-elf', 'riscv64gc-unknown-linux-gnu', 'riscv64gc-unknown-none-elf', 'riscv64imac-unknown-none-elf', 'thumbv7neon-linux-androideabi', 'thumbv7neon-unknown-linux-gnueabihf', 'thumbv8m.base-none-eabi', 'thumbv8m.main-none-eabi', 'thumbv8m.main-none-eabihf', 'x86_64-fortanix-unknown-sgx', 'x86_64-pc-solaris'];
</script>
<style lang="scss" scoped>
.search-bar {
    height: auto !important;
    .header {
        text-align: center;
    }
    .search-form {
        .channel-input {
            width: 100px;
        }
        .target-input {
            width: 260px;
        }
        .date-range-input /deep/ .el-date-editor.el-range-editor.el-input__inner.el-date-editor--daterange {
            width: 220px;
        }
    }
}
.search-result {
    flex-grow: 1;
    /deep/ .el-table__header .is-leaf {
        &.preferable-build {
            color: #67C23A;
        }
        &.imperfect-build {
            color: #E6A23C;
        }
        &.nullified-build {
            color: #F56C6C;
        }
    }
}
</style>
