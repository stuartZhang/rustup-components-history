<template>
    <fragment>
        <el-tree class="tree" node-key="id" :props="defaultProps" :data="domains" @node-click="onClick">
            <template #default="{node}">
                <span>
                    <img :src="require('../assets/images/favicon.ico').default" class="tree-node-icon">
                    <span class="tree-node-text">CD: {{node.label}}</span>
                </span>
            </template>
        </el-tree>
    </fragment>
</template>
<script lang="ts">
import {computed, defineComponent, onMounted, ref} from '@vue/composition-api';
import pcLog from 'mx-general.macros/dist/log-sync.macro';
export default defineComponent({
    name: 'ElementUiCaDemo',
    setup(props, context){
        const store = context.parent.$store;
        // lifecycles
        onMounted(async () => {
            await store.dispatch('getDomainIds');
        });
        return {
            // data
            defaultProps: ref({
                children: 'children',
                label: 'name'
            }),
            // computed
            domains: computed(() => store.state.domains),
            // methods
            async onClick(data: {name: string}/* , node, comp */): Promise<void>{
                pcLog.warn(`选中：${data.name}`);
                await alertAsync(`选中：${data.name}`);
                throw new Error(`抛出异常 ${data.name}`);
            }
        };
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
