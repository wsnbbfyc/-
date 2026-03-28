import { createRouter, createWebHistory } from 'vue-router'
import Login from '../view/login.vue'
import Register from '../view/register.vue'
import ChangePassword from '../view/change-password.vue'
import Dashboard from '../view/dashboard.vue'
import UserManagement from '../view/user-management.vue'
import AlarmManagement from '../view/alarm-management.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: ChangePassword
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/user-management',
    name: 'UserManagement',
    component: UserManagement
  },
  {
    path: '/alarm-management',
    name: 'AlarmManagement',
    component: AlarmManagement
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router