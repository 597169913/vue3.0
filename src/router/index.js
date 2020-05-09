import Vue from 'vue'
import Router from 'vue-router'
import test from '../views/Test'
import HelloWorld from '../components/HelloWorld'
Vue.use(Router)
export const appRounter = [
  {
    path: '/',
    component: test
  },
  {
    path: '/hello',
    component: HelloWorld
  },
]
export default new Router({ routes: appRounter })