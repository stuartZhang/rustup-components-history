<template>
    <router-view class="route-viewer" />
</template>
<script lang="ts">
import {defineComponent} from '@vue/composition-api';
export default defineComponent({
    name: 'App'
});
</script>
<style lang="less" scoped>
.route-viewer {
    height: 100%;
    box-sizing: border-box;
}
</style>
