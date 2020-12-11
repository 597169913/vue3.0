<template>
  <div class="calender-home" :style="{height: height+ 'px'}">
    <FullCalendar :options="calendarOptions" />
    <!-- <day-setting-dialog></day-setting-dialog> -->
  </div>
</template>
<script>
import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import moment from 'moment'
// import DaySettingDialog from './DaySettingDialog'

export default {
  components: {
    FullCalendar // make the <FullCalendar> tag available
    //DaySettingDialog
  },
  data() {
    return {
      height: document.documentElement.clientHeight - 300,
      calendarOptions: {
        height: document.documentElement.clientHeight - 300,
        locale: 'zh-cn',
        themeSystem: 'bootstrap',
        plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
          // 日历头部按钮位置
          left: 'prev,next',
          center: 'title',
          right: 'today dayGridMonth,timeGridWeek,timeGridDay'
        },
        footerToolbar: {
          center: 'custom1 custom2'
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
        eventsSet: this.handleEvents
      },
      eventSources: {}
    }
  },
  methods: {
    dayClick() {
      alert('触发dayClick事件！')
    },
    handleDateSelect(selectInfo) {
      let title = prompt('Please enter a new title for your event')
      let calendarApi = selectInfo.view.calendar

      calendarApi.unselect() // clear date selection

      if (title) {
        calendarApi.addEvent({
          id: this.getGuid(),
          title,
          start: selectInfo.startStr,
          end: selectInfo.endStr,
          allDay: selectInfo.allDay,
          className: 'holiday',
          color: 'red'
        })
      }
    },
    getGuid() {
      const S4 = () =>
        (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
      return (
        S4() +
        S4() +
        '-' +
        S4() +
        '-' +
        S4() +
        '-' +
        S4() +
        '-' +
        S4() +
        S4() +
        S4()
      )
    },
    handleEventClick(clickInfo) {
      if (
        confirm(
          `Are you sure you want to delete the event '${clickInfo.event.title}'`
        )
      ) {
        clickInfo.event.remove()
      }
    },
    handleEvents(events) {
      this.currentEvents = events
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
