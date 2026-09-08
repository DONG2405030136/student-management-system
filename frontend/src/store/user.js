import { defineStore } from 'pinia';
import { login, getMe } from '../api';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null')
  }),
  getters: {
    isLoggedIn: (s) => !!s.token,
    role: (s) => s.user?.role || ''
  },
  actions: {
    async login(username, password) {
      const res = await login({ username, password });
      this.token = res.data.token;
      this.user = res.data.user;
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));
      return res;
    },
    async fetchMe() {
      const res = await getMe();
      this.user = { ...this.user, ...res.data };
      localStorage.setItem('user', JSON.stringify(this.user));
      return res.data;
    },
    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});
