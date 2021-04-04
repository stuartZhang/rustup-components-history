import 'core-js/es/promise';
import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            name: 'ElementUiCaDemo',
            component(): Promise<Vue.Import>{
                return import(/* webpackChunkName: "ElementUiCaDemo" */'@/components/ElementUiCaDemo.vue');
            }
        }, {
            path: '/oa',
            name: 'ElementUiOaDemo',
            component(): Promise<Vue.Import>{
                return import(/* webpackChunkName: "ElementUiOaDemo" */'@/components/ElementUiOaDemo.vue');
            }
        }
    ]
});
