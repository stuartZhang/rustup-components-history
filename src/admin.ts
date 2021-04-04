import pcLog from 'mx-general.macros/dist/log-sync.macro';
// =========== Vue Launcher ===========
import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';
import {Plugin as FragmentPlugin} from 'vue-fragment';
import App from './App.vue';
import router from './router';
import axiosPlugin from './axios';
import store from './store';
import moment from './moment';

import ElementUI from './element-ui';
import {i18n, loadLanguageAsync} from './i18n';

Vue.config.productionTip = false;
Vue.config.performance = process.env.NODE_ENV !== 'production';

Vue.use(VueCompositionApi);
Vue.use(FragmentPlugin);

Vue.use(ElementUI);
Vue.use(axiosPlugin);
Vue.use(moment);

new Vue({
    router,
    store,
    i18n,
    components: {
        App(): Promise<Vue.Component>{
            return loadLanguageAsync(navigator.language).then(() => App);
        }
    },
    
    errorCaptured: process.env.SENTRY_ERR_TRACE ?
        (err, vm, info): void => {
            pcLog.error('Vue.$root.errorCaptured', vm.$options && vm.$options.name, info, err);
        } :
        undefined
}).$mount('#app');

window.addEventListener('resize', () => store.commit('setWindowSize', {
    width: window.innerWidth,
    height: window.innerHeight
}));
