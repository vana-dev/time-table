<template>
  <div class="time-table">
    <div class="time-table-item time-table-item--header">
      <div class="day"></div>
      <div class="tasks tasks--header">
        <div v-for="index in 24" :key="index" :class="['tasks-item--header', index > 8 && index < 20 ? 'tasks-item--header--workday' : '']">{{index - 1 }}</div>
      </div>
      <div class="actions"></div>
      <div class="time"></div>
    </div>
    <div v-for="(item, index) in getByDate" :key="index" class="time-table-item">
      <div :class="['day', moment(item.date).isoWeekday() >= 6 ? 'day--weekend' : '']">
        <div class="day-date">{{ moment.utc(item.date).format('DD/MM') }}</div>
        <div class="day-name">{{ moment.utc(item.date).format('dddd') }}</div>
      </div>
      <div class="tasks">
        <div v-for="task in item.tasks" :key="task.id" :class="['tasks-item', 'tasks-item--' + task.status]" :style="{ width: task.taskWidth + '%', left: task.taskPosition +'%'}" @click="editTask(task)">
          <h3 class="tasks-item-name">{{ task.taskName }}</h3>
          <h4 class="tasks-item-time">{{ task.taskTime.format('H:mm') }}</h4>
        </div>
      </div>
      <div class="actions">
        <div @click="addTask(item.date)" class="btn btn--small">+</div>
      </div>
      <div class="time">{{ item.totalTime }}</div>
    </div>
    <transition name="fade">
      <div v-if="showModal" class="modal">
        <div class="modal-container">
          <h3 class="modal-title">{{ modalType == 'edit' ? 'Edytuj raport' : 'Dodaj raport' }}</h3>
          <form @submit.prevent="modalType == 'edit' ? editTaskForm() : addTaskForm()" class="form">
            <div class="form-group">
              <label for="taskName" class="label">Wybierz zadanie</label>
              <select v-model="selectedTask.taskId" class="input input--select">
                <option value="0" disabled selected hidden>Kliknij aby wybrać</option>
                <option v-for="option in getTasksNames" :key="option.id" :value="option.id">{{ option.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="taskStart" class="label">Czas rozpoczęcia</label>
              <input :value="formatTime(selectedTask.start)" @blur="changeInputTime($event.target.value, 'start')" type="time" class="input" id="taskStart">
            </div>
            <div class="form-group">
              <label for="taskEnd" class="label">Czas zakończenia</label>
              <input :value="formatTime(selectedTask.end)" @blur="changeInputTime($event.target.value, 'end')" type="time" class="input" id="taskEnd">
            </div>
            <transition name="fade">
              <div v-if="formErrors.length" class="errors">{{ formErrors[0] }}</div>
            </transition>
            <div class="btn-container">
              <button class="btn" type="button" @click="closeModal">Anuluj</button>
              <button class="btn" type="submit">{{ modalType == 'edit' ? 'Zapisz' : 'Dodaj' }}</button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios'
import _ from 'lodash'
import moment from 'moment'

moment.locale('pl')

export default {
  name: 'TimeTable',
  data () {
    return {
      data: {},
      showModal: false,
      modalType: null,
      formErrors: [],
      selectedTask: null
    }
  },
  mounted () {
    axios
      .get('http://localhost:3000/userTasks')
      .then(response => {
        this.data = response.data
      })
      .catch(error => {
        console.log(error)
      })
      .finally(() => this.loading = false)
  },
  methods: {
    formatDate: function (date) {
      return moment.utc(date).format('DD/MM dddd')
    },
    formatTime: function (date) {
      return moment.utc(date).format('HH:mm')
    },
    changeInputTime: function(value, type) {
      this.formErrors.length = 0
      const self = this
      const time = value.split(':')
      const newTime = moment.utc(this.selectedTask[type]).set({h: time[0], m: time[1]}).format()
      this.selectedTask[type] = newTime
      
      const dayliTasks = this.getDailyTasksTime(this.selectedTask.date)

      const otherTasks = _.filter(dayliTasks, function(o) { return o.id != self.selectedTask.id })

      _.forEach(otherTasks, function(elem) {
        
        if (type == 'start' && moment(newTime).isBefore(elem.start) ) {
          if (!moment(self.selectedTask.end).isBefore(elem.start)) {
            self.formErrors.push('w tym czasie jest juz zaraportowane zdarzenie')
          }
        }

        if (type == 'end' && moment(newTime).isAfter(elem.end) ) {
          if (!moment(self.selectedTask.start).isAfter(elem.end)) {
            self.formErrors.push('w tym czasie jest juz zaraportowane zdarzenie')
          }
        }

        if (moment(newTime).isBetween(elem.start, elem.end)) {
          self.formErrors.push('w tym czasie jest juz zaraportowane zdarzenie')
        }

      })

      if (type == 'start' && moment(newTime).isAfter(self.selectedTask.end)) {
          self.formErrors.push('czas rozpoczęcia nie moze być po czasie zakończenia')
      }

      if (type == 'end' && moment(newTime).isBefore(self.selectedTask.start)) {
          self.formErrors.push('czas zakończenia nie moe być przed czasem rozpoczęcia')
      }
    
    },
    addTask: function(date) {
      this.showModal = true
      this.modalType = 'add'
      this.selectedTask = {
        date: date,
        taskId: 0,
        start: moment.utc(date).startOf('day').format(),
        end: moment.utc(date).startOf('day').format(),
        status: 'pending'
      }
    },
    addTaskForm: function() {
      const self = this
      const taskId = this.selectedTask.taskId
      const dataTask = _.find(this.data, { 'id': taskId })

      if (this.formErrors.length === 0 && taskId) {
        const newTask = {
          id: 9999,
          start: this.selectedTask.start,
          end: this.selectedTask.end,
          status: 'pending'
        }

        dataTask.logs.push(newTask)

        axios
        .patch('http://localhost:3000/userTasks/'+ taskId, dataTask)
        .then(response => {
          console.log(response)
        })
        .catch(error => {
          console.log(error)
        })
        .finally(() => self.showModal = false)
      }

    },
    editTaskForm: function() {
      const self = this
      const taskId = this.selectedTask.taskId
      const logId = this.selectedTask.id
      const dataTask = _.find(this.data, { 'id': taskId })
      let currentDataTask = _.find(dataTask.logs, { 'id': logId })

      if (this.formErrors.length === 0) {

        currentDataTask.start = this.selectedTask.start
        currentDataTask.end = this.selectedTask.end

        axios
        .patch('http://localhost:3000/userTasks/'+ taskId, dataTask)
        .then(response => {
          console.log(response)
        })
        .catch(error => {
          console.log(error)
        })
        .finally(() => self.showModal = false)
      }

    },
    getDuration: function (end, start) {
      const startTime = moment.utc(start)
      const endTime = moment.utc(end)
      const diff = moment.duration(endTime.diff(startTime))
      const milliseconds = diff.asMilliseconds()
      return {
        time: moment.utc(milliseconds),
        width: diff.asHours() / 24 * 100,
        position: (startTime.hours() + (startTime.minutes() / 60)) / 24 * 100
      }
    },
    getDailyTasksTime: function(date) {
      const result = _.find(this.getByDate, {'date': date })
      return result.tasks
    },
    editTask: function (task) {
      this.showModal = true
      this.modalType = 'edit'
      this.selectedTask = _.clone(task)
    },
    closeModal: function() {
      this.showModal = false
      this.modalType = null
      this.formErrors.length = 0
      this.selectedTask = null
    }
  },
  computed: {
    getLogs: function () {
      const self = this
      let logs = [] 
      _.forEach(_.cloneDeep(this.data), function(value) {
        const taskId = value.id
        const taskName = value.name
        value.logs.map((element) => {
          element.taskId = taskId
          element.taskName = taskName
          element.taskTime = self.getDuration(element.end, element.start).time
          element.taskPosition = self.getDuration(element.end, element.start).position
          element.taskWidth = self.getDuration(element.end, element.start).width
          element.date = moment.utc(element.start).startOf('day').format()
          return element
        })
        logs.push(value.logs)
      })
      return _.flatten(logs)
    },
    getByDate: function () {
      let filldays = []
      const result = _.chain(this.getLogs)
      .groupBy('date')
      .map((tasks, date) => ({ tasks, date }))
      .value()
      .sort((d1, d2) => moment(d1.date) - moment(d2.date))
      .map((element) => {
        if (element.tasks.length > 1) {
          element.totalTime = moment.utc(_.sumBy(_.filter(element.tasks, function(o) { return o.status != 'warning'}), function(o) { return o.taskTime })).format('HH:mm')
        } else {
          element.totalTime = element.tasks[0].taskTime.format('HH:mm')
        }
        return element
      })

      if(result.length > 0) {
        const start = moment.utc(result[0].date)
        const end = moment.utc(result[result.length - 1].date)
        const diff = end.diff(start, 'days') + 1
        let days = []
        let i 

        for (i = 0; i < diff; i++) {
          days.push({
            date: new moment(start).add(i, 'days').format(),
            tasks: [],
            totalTime: 0
          })
        }
        filldays = _.map(days, function(obj) {
          return _.assign(obj, _.find(result, {date: obj.date}))
        })
      }

      return filldays
    },
    getTasksNames: function() {
      const result = this.data.map((element) => {
        return { name: element.name, id: element.id }
      })
      return result
    }
  }
}
</script>

<style lang="scss">

.time-table {
  box-shadow: 0 1px 0 0 rgba(0,0,0,0.05);
}
.time-table-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 82px;
  min-width: 800px;
  box-shadow: inset 0 1px 0 0 rgba(0,0,0,0.05);
  background-color: #f7f7f7;
  transition: all 0.4s ease;
  &:hover {
    background-color: #ffffff;
  }
  .day {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 140px;
    height: 100%;
    text-align: left;
    padding: 20px;
    background: #fff;
    box-shadow: inset -1px 0 0 0 rgba(0,0,0,0.05), inset 0 1px 0 0 rgba(0,0,0,0.05);
    &--weekend {
      color: #c1c1c1;
    }
    .day-date {
      font-weight: bold;
    }
  }
  .actions {
    flex-shrink: 0;
    width: 50px;
  }
  .time {
    flex-shrink: 0;
    width: 80px;
  }
  .tasks {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 42px;
    position: relative;
    &:before {
      content: '';
      width: 1px;
      height: calc(40px + 100%);
      background-color: #eee;
      position: absolute;
      top: -20px;
      left: 33.3333%;
      z-index: 0;
    }
    &:after {
      content: '';
      width: 1px;
      height: calc(40px + 100%);
      background-color: #eee;
      position: absolute;
      top: -20px;
      left: 66.6666%;
      z-index: 0;
    }
    &--header {
      height: auto;
      &::before, &:after {
        display: none;
      }
      .tasks-item--header {
        width: (100% / 24);
        text-align: left;
        color: #c1c1c1;
        font-size: 14px;
        &--workday {
          font-weight: bold;
          color: #5f5f5f;
          font-weight: bold;
        }
      }
    }
    .tasks-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      box-shadow: inset 0 0 0 2px #eee;
      background-color: #fff;
      border-radius: 8px;
      padding: 0 10px;
      position: absolute;
      z-index: 1;
      transition: all 0.4s ease;
      cursor: pointer;
      &--accepted {
        .tasks-item-time {
          background-color: #288800;
        }
      }
      &--pending {
        .tasks-item-time {
          background-color: #595eff;
        }
      }
      &--active {
        .tasks-item-time {
          background-color: #a5a5a5;
        }
      }
      &--warning {
        box-shadow: inset 0 0 0 2px #ff0000;
        color: #ff0000;
        .tasks-item-time {
          background-color: #ff0000;
        }
      }
      h3, h4 {
        padding: 0;
        margin: 0;
        line-height: 1.2;
        white-space: nowrap;
      }
      .tasks-item-name {
        font-size: 13px;
        text-align: left;
        overflow: hidden;
        width: 100%;
        position: relative;
        &:after {
          content: '';
          height: 100%;
          width: 20px;
          position: absolute;
          right: 0;
          background: rgb(255,255,255);
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%);
        }
      }
      .tasks-item-time {
        border-radius: 4px;
        padding: 4px;
        margin: 0 0 0 10px;
        color: #fff;
        font-size: 12px;
      }
    }
  }
  &--header {
    background-color: #fff;
    height: 60px;
    .day {
      box-shadow: none;
    }
  }
}
</style>