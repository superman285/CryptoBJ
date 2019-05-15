import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import { i18n } from './i18n';
Vue.config.productionTip = false;

const locale = window.localStorage.getItem('_i_locale') || 'en';
store.dispatch('setLocale', locale);

new Vue({
    i18n,
    router,
    store,
    render: h => h(App),
}).$mount('#app');
