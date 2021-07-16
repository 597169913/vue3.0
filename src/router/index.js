import Vue from 'vue'
import Router from 'vue-router'
import test from '../views/Test'
import HelloWorld from '../components/HelloWorld'
import calendar from '../views/calendar/calendarIndex'
import practice from '../views/practice/practiceIndex.vue'
// import docweb from '../views/document/docIndex'
import demo from '../views/demo/demoIndex'
import table from '../views/table/tableIndex'
import threeIndex from 'views/threeMap/threeIndex'

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
  // {
  //     path: '/docweb',
  //     component: docweb
  // },
  {
    path: '/demo',
    component: demo
  }, {
    path: '/table',
    component: table
  },
  {
    path: '/threemap',
    component: threeIndex
  }
]
export default new Router({ routes: appRounter })