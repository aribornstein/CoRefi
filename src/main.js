import Vue from 'vue'
import App from './App.vue'
import wrap from '@vue/web-component-wrapper';

// new Vue({
//   vuetify,
//   VueTour,
//   render: h => h(App)
// }).$mount('#app')

const WrappedElement = wrap(Vue, App);
window.customElements.define('cdc-tool', WrappedElement);