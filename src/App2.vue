<template>
    <fragment>
        <div class="demo-header">
            <img :src="require('./assets/images/favicon.ico').default">
        </div>
        <div class="content">
            <h3>{{$t('misc.demo')}}<sup>{{$moment().format('LLLL')}}</sup></h3>
            
            <p>第二入口页</p>
        </div>
    </fragment>
</template>
<script lang="ts">
import {defineComponent  } from '@vue/composition-api';

export default defineComponent({
    name: 'App2'
});
</script>
<style lang="less" scoped>
.demo-header {
    text-align: center;
    margin-top: 60px;
}
.content {
    height: 100%;
    box-sizing: border-box;
    color: #2C3E50;
}
</style>
