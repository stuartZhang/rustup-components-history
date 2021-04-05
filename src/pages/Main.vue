<template>
    <el-container>
        <el-header class="search-bar">
            <h2 class="header"><code>rustup</code>组件历史状态表</h2>
            <el-form inline :model="searchForm" class="search-form">
                <el-form-item label="频道">
                    <el-input v-model="searchForm.channel" placeholder="请输入内容" />
                </el-form-item>
                <el-form-item label="目标">
                    <el-input v-model="searchForm.target" placeholder="请输入内容" />
                </el-form-item>
                <el-form-item label="时间区间">
                    <el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
                </el-form-item>
                <el-button type="primary" @click.prevent.stop="onClick">查询</el-button>
            </el-form>
        </el-header>
        <el-main>
            <el-table v-loading="searchResult.loading" height="500" element-loading-text="拼命加载中" :data="searchResult.data" border>
                <el-table-column fixed prop="name" label="组件" width="110" />
                <el-table-column width="100" v-for="col of searchResult.columns" :key="col.label" :prop="col.label" :label="col.label" align="center" />
            </el-table>
        </el-main>
    </el-container>
</template>
<script lang="ts">
import {defineComponent, reactive} from '@vue/composition-api';
import pcLog from 'mx-general.macros/dist/log-sync.macro';
import _ from 'underscore';
export default defineComponent({
    name: 'Main',
    setup(props, context){ // eslint-disable-line max-lines-per-function
        const axios = context.parent.$axios;
        const moment = context.parent.$moment;
        const searchForm = reactive({
            dateRange: [moment('2020-11-01', 'YYYY-MM-DD').toDate(), moment('2020-11-30', 'YYYY-MM-DD').toDate()],
            channel: 'nightly',
            target: 'x86_64-pc-windows-gnu'
        });
        const searchResult = reactive({
            loading: false,
            columns: [],
            data: []
        });
        return {
            searchResult,
            searchForm,
            async onClick(){
                if (searchResult.loading) {
                    return;
                }
                searchResult.loading = true;
                searchResult.data.length = 0;
                searchResult.columns.length = 0;
                const [startDate, endDate] = searchForm.dateRange;
                const startMom = moment(startDate);
                const endMom = moment(endDate);
                const days = [];
                const components = new Set();
                const promises = [];
                while (startMom.isSameOrBefore(endMom)) {
                    const date = startMom.format('YYYY-MM-DD');
                    promises.push(requestSingleDay(date).then(dayItems => {
                        const compItems = _.groupBy(dayItems, 'component');
                        const compNames = Object.keys(compItems);
                        compNames.forEach(compName => components.add(compName));
                        days.push({
                            date,
                            compNames,
                            dayItems
                        });
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
                            row[day.date] = 'Y';
                        } else {
                            row[day.date] = '-';
                        }
                    });
                    searchResult.data.push(row);
                });
                searchResult.loading = false;
            }
        };
        function requestSingleDay(date){
            const postfix = `${searchForm.channel}-${searchForm.target}.tar.gz`;
            return request(date, '').then(result => result.filter(item => item.fileName.endsWith(postfix)).map(item => ({
                ...item,
                component: item.fileName.replace(`-${postfix}`, '')
            })));
        }
        function request(date, marker, result = []){
            return axios.get('https://static.rust-lang.org/', {
                params: {
                    prefix: `dist/${date}`,
                    marker
                }
            }).then(response => handle(result, date, new DOMParser().parseFromString(response.data, 'text/xml')));
        }
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
                    downloadUrl: `/${key.textContent}`,
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
});
function renderFileSize(n){
    function renderTwo(n){
        return Math.round(n * 100) / 100;
    }
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
}
</script>
<style lang="scss" scoped>
.search-bar {
    height: auto !important;
    .header {
        text-align: center;
    }
}
</style>
