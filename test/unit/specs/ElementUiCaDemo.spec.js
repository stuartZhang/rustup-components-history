import Vue from 'vue';
import ElementUiCaDemo from '@/components/ElementUiCaDemo';

describe('ElementUiCaDemo.vue', () => {
    it('should render correct contents', () => {
        const Constructor = Vue.extend(ElementUiCaDemo);
        const vm = new Constructor().$mount();
        expect(vm.$el.querySelector('.hello h1').textContent)
            .to.equal('Welcome to Your Vue.js App');
    });
});
