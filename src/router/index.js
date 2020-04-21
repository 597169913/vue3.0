import Vue from 'vue'
import Router from 'vue-router'
import test from '../views/Test'
Vue.use(Router)
export const appRounter = [
  {
    path: '/',
    component: test
  }
]
export default new Router({ routes: appRounter })