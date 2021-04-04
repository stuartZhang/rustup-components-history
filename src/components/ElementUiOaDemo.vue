<template>
    <el-tree class="tree" node-key="id" :props="defaultProps" :data="domains" @node-click="onClick">
        <template #default="{node}">
            <span>
                <img :src="require('../assets/images/favicon.ico').default" class="tree-node-icon">
                <span class="tree-node-text">CD: {{node.label}}</span>
            </span>
        </template>
    </el-tree>
</template>
<script lang="ts">
import Vue from 'vue';
import pcLog from 'mx-general.macros/dist/log-sync.macro';
export default Vue.extend({
    name: 'ElementUiOaDemo',
    data(){
        return {
            defaultProps: {
                children: 'children',
                label: 'name'
            }
        };
    },
    computed: {
        domains(): Vuex.Domain[]{
            return this.$store.state.domains;
        }
    },
    methods: {
        async onClick(data: {name: string}/* , node, comp */): Promise<void>{
            pcLog.warn(`选中：${data.name}`);
            await alertAsync(`选中：${data.name}`);
            throw new Error(`抛出异常 ${data.name}`);
        }
    },
    async mounted(){
        await this.$store.dispatch('getDomainIds');
    }
});
</script>
<style scoped>
.tree {
    width: 150px;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
}
.tree-node-icon {
    width: 20px;
    height: 20px;
}
.tree-node-icon,
.tree-node-text {
    vertical-align: middle;
}
</style>
