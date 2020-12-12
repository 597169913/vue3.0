<template>
  <div class="calender-home" :style="{height: height+ 'px'}">
    <FullCalendar :options="calendarOptions" />
    <day-setting-dialog ref="settingDialog"></day-setting-dialog>
  </div>
</template>
<script>
import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import moment from 'moment'
import DaySettingDialog from './DaySettingDialog'
// import bootstrapPlugin from '@fullcalendar/bootstrap'

export default {
  components: {
    FullCalendar, // make the <FullCalendar> tag available
    DaySettingDialog
  },
  data() {
    return {
      height: document.documentElement.clientHeight - 300,
      calendarOptions: {
        height: document.documentElement.clientHeight - 300,
        locale: 'zh-cn',
        // themeSystem: 'bootstrap',
        plugins: [
          dayGridPlugin,
          interactionPlugin,
          timeGridPlugin
          // bootstrapPlugin
        ],
        initialView: 'dayGridMonth',
        headerToolbar: {
          // 日历头部按钮位置
          left: 'prev,next',
          center: 'title',
          right: 'today dayGridMonth,timeGridWeek,timeGridDay'
        },
        footerToolbar: {
          center: 'custom1 custom2 custom3 custom4'
        },
        firstDay: 1,
        eventColor: '#3BB2E3',
        initialDate: moment().format('YYYY-MM-DD'),
        eventLimit: true,
        buttonText: {
          today: '今天',
          month: '月',
          week: '周',
          day: '日',
          prev: '上一月',
          next: '下一月'
        },
        slotLabelFormat: {
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false,
          hour12: false // 设置时间为24小时
        },
        customButtons: {
          custom1: {
            text: '批量设置节假日',
            click: () => {
              alert('clicked the custom1 button!')
            }
          },
          custom2: {
            text: '批量设置周末',
            click: () => {
              alert('clicked the custom2 button!')
            }
          },
          custom3: {
            text: '设置节假日',
            click: () => {
              alert('clicked the custom3 button!')
            }
          },
          custom4: {
            text: '设置周末',
            click: () => {
              alert('clicked the custom4 button!')
            }
          }
        },
        selectMinDistance: 0,
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true,
        select: this.handleDateSelect,
        eventClick: this.handleEventClick,
        eventsSet: this.handleEvents,
        eventRender: this.handleEventRender,
        eventChange: this.handleEventChange,
        eventContent: this.handleEventContent
      },
      eventSources: {}
    }
  },
  methods: {
    dayClick() {
      alert('触发dayClick事件！')
    },
    handleDateSelect(selectInfo) {
      // let title = prompt('Please enter a new title for your event')
      let calendarApi = selectInfo.view.calendar
      calendarApi.unselect() // clear date selection
      this.$refs.settingDialog.show(calendarApi, selectInfo)
    },

    handleEventClick(clickInfo) {
      // if (
      //   confirm(
      //     `Are you sure you want to delete the event '${clickInfo.event.title}'`
      //   )
      // ) {
      //   clickInfo.event.remove()
      // }
      this.$refs.settingDialog.edit(clickInfo)
    },
    handleEventRender(event, element) {
      element.qtip({
        content: event.description
      })
    },
    handleEvents(events) {
      this.currentEvents = events
    },
    handleEventChange(event) {
      console.log(event)
    },
    handleEventContent(arg) {
      const italicEl = document.createElement('span')
      italicEl.innerHTML = arg.event._def.title
      const italicEl1 = document.createElement('span')
      italicEl1.className = 'delete-btn'
      italicEl1.innerHTML = '删除'
      const arrayOfDomNodes = [italicEl, italicEl1]
      return {
        domNodes: arrayOfDomNodes
      }
    }
  }
}
</script>
<style scoped>
.calender-home {
  width: 80%;
  margin: 0 auto;
  height: 80%;
}
</style>
<style>
.delete-btn {
  position: absolute;
  right: 10px;
}
</style>