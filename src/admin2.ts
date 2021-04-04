// =========== Vue Launcher ===========
import VueCompositionApi from '@vue/composition-api';
import {Plugin as FragmentPlugin} from 'vue-fragment';
import Vue from 'vue';
import App2 from './App2.vue';
import axiosPlugin from './axios';
import moment from './moment';
import {i18n, loadLanguageAsync} from './i18n';

Vue.config.productionTip = false;
Vue.config.performance = process.env.NODE_ENV !== 'production';

Vue.use(VueCompositionApi);
Vue.use(FragmentPlugin);
Vue.use(axiosPlugin);
Vue.use(moment);

new Vue({
    i18n,
    components: {
        App2(): Promise<Vue.Component>{
            return loadLanguageAsync(navigator.language).then(() => App2);
        }
    }
    
}).$mount('#app');
