import App from './App.vue'
import { createApp } from 'vue'
import { createPinia } from 'pinia';
import piniaPersist from 'pinia-plugin-persist'
import VueConnectWallet from "vue-connect-wallet";
import "vue-connect-wallet/dist/style.css";

const pinia = createPinia();
pinia.use(piniaPersist);

createApp(App)
.use(pinia)
.use(VueConnectWallet)
.mount('#app');
