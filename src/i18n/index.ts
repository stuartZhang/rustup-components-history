import Vue from 'vue';
import axios from 'axios';
import moment from 'moment';
import VueI18n from 'vue-i18n';
import zh from './langs/zh';

Vue.use(VueI18n);

const loadedLanguages = ['zh']; // 默认中文bundle

export const i18n = new VueI18n({
    locale: loadedLanguages[0], // 语言标识
    fallbackLocale: loadedLanguages[0],
    messages: {
        zh
    }
});
function setI18nLanguage(lang: string): string{
    i18n.locale = lang;
    moment.locale(lang);
    axios.defaults.headers.common['Accept-Language'] = lang;
    const dom = document.querySelector('html');
    if (dom) {
        dom.setAttribute('lang', lang);
    }
    return lang;
}
export function loadLanguageAsync(lang: string): Promise<string>{
    const index = lang.indexOf('-');
    if (~index) {
        lang = lang.substring(0, index);
    }
    lang = lang.toLowerCase();
    if (!loadedLanguages.includes(lang)) {
        return import(/* webpackChunkName: "lang-[request]" */ `./langs/${lang}`).then(({default: bundle}) => {
            i18n.setLocaleMessage(lang, bundle);
            loadedLanguages.push(lang);
            return setI18nLanguage(lang);
        });
    }
    return Promise.resolve(setI18nLanguage(lang));
}
