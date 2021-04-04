import 'core-js/es/promise';
import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            name: 'Main',
            component(): Promise<Vue.Import>{
                return import(/* webpackChunkName: "Main" */'@/pages/Main.vue');
            }
        }
    ]
});
