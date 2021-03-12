import Vue from 'vue'
import Router from 'vue-router'
import test from '../views/Test'
import HelloWorld from '../components/HelloWorld'
import calendar from '../views/calendar/calendarIndex'
import practice from '../views/practice/practiceIndex.vue'
import docweb from '../views/document/docIndex'
import demo from '../views/demo/demoIndex'
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
  {
    path: '/calendar',
    component: calendar
  },
  {
    path: '/practice',
    component: practice
  },
  {
    path: '/docweb',
    component: docweb
  },
  {
    path: '/demo',
    component: demo
  }
]
export default new Router({ routes: appRounter })