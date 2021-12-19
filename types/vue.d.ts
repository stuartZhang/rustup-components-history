/**
 * Extends interfaces in Vue.js
 */
import {AxiosStatic} from "axios";
import moment from 'moment';
declare module "vue/types/umd" {
    export type Import = typeof import('*.vue');
}
declare module "vue/types/vue" {
    interface Vue {
        readonly $axios: AxiosStatic;
        readonly $moment: typeof moment;
    }
}
