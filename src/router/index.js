import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import moment from 'moment'

Vue.prototype.moment = moment

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Home
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
