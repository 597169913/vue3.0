import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'leaflet/dist/leaflet.css'
import 'assets/css/default.css'
import router from './router'
import '@logicflow/core/dist/style/index.css';
import 'vxe-table/lib/style.css'
import VXETable from 'vxe-table'
// import 'bootstrap/dist/css/bootstrap.css'
// import '@fortawesome/fontawesome-free/css/all.css'
Vue.config.productionTip = false
Vue.use(VXETable)
Vue.use(ElementUI)
new Vue({
  render: h => h(App),
  router
}).$mount('#app')
