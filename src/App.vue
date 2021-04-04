<template>
    <fragment>
        <div class="demo-header">
            <div><img :src="require('./assets/images/favicon.ico').default"></div>
            <h3>{{$t('misc.demo')}}<sup>{{$moment().format('LLLL')}}</sup></h3>
            
            <ul class="toggle">
                <li><router-link to="/" tag="label" name="vue-api-fashion"><input type="radio" :checked="$route.path === '/'"> Composition API Demo</router-link></li>
                <li><router-link to="/oa" tag="label" name="vue-api-fashion"><input type="radio" :checked="$route.path === '/oa'"> Option API Demo</router-link></li>
            </ul>
        </div>
        <router-view class="route-viewer" />
    </fragment>
</template>
<script lang="ts">
import {defineComponent  } from '@vue/composition-api';

export default defineComponent({
    name: 'App'
});
</script>
<style lang="less" scoped>
.demo-header {
    @svg square {
        @rect {
            fill: var(--color, black);
            width: var(--size, 100%);
            height: var(--size, 100%);
        }
    }

    color: #2C3E50;
    margin-top: 60px;
    text-align: center;
    &:before {
        content: " ";
        display: block;
        width: 100%;
        height: 1px; /* px */
        background: svg(square param(--color green));
    }
    &:after {
        content: " ";
        display: block;
        width: 100%;
        height: 1px; /* px */
        background: svg(square);
    }
    .toggle {
        display: inline-block;
        text-align: left;
        :not(input) {
            cursor: pointer;
        }
    }
}
.route-viewer {
    height: 100%;
    box-sizing: border-box;
}
</style>
