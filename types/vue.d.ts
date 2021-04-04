/**
 * Extends interfaces in Vue.js
 */
import {AxiosStatic} from "axios";
import {Moment} from 'moment';
declare module "vue/types/umd" {
    export type Import = typeof import('*.vue');
}
declare module "vue/types/vue" {
    interface Vue {
        readonly $axios: AxiosStatic;
        readonly $moment: Moment;
    }
}
