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
import 'cesium/Build/Cesium/Widgets/widgets.css'
// import 'bootstrap/dist/css/bootstrap.css'
// import '@fortawesome/fontawesome-free/css/all.css'
Vue.config.productionTip = false
Vue.use(VXETable)
Vue.use(ElementUI)

// 全局自定义拖拽组件
Vue.directive('drag', {
  //1.指令绑定到元素上回立刻执行bind函数，只执行一次
  //2.每个函数中第一个参数永远是el，表示绑定指令的元素，el参数是原生js对象
  bind: function (el, elementObj) {
    let dragBox = el; //获取当前元素
    dragBox.style.position = 'absolute'; // 拖拽元素使用定位，脱离文档流
    dragBox.style.cursor = 'move'
    dragBox.onmousedown = e => {
      //鼠标相对元素的位置
      const disX = e.clientX - dragBox.offsetLeft;
      const disY = e.clientY - dragBox.offsetTop;
      document.onmousemove = e => {
        //鼠标的位置减去鼠标相对元素的位置，得到元素的位置
        let left = e.clientX - disX;
        let top = e.clientY - disY;
        //移动当前元素
        dragBox.style.left = left + 'px';
        dragBox.style.top = top + 'px';
      };
      document.onmouseup = () => {
        //鼠标弹起来的时候不再移动
        document.onmousemove = null;
        //预防鼠标弹起来后还会循环（即预防鼠标放上去的时候还会移动）
        document.onmouseup = null;
        // 对外暴露元素相对于父级位置
        elementObj.value.left = dragBox.style.left;
        elementObj.value.top = dragBox.style.top;
        dragBox.style.cursor = 'default'
      };
    };
  }
});
new Vue({
  render: h => h(App),
  router
}).$mount('#app')