import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '../router';

const request = axios.create({
  baseURL: '/api',
  timeout: 15000
});

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

request.interceptors.response.use(
  (res) => {
    const data = res.data;
    if (data && data.code !== undefined && data.code !== 0) {
      ElMessage.error(data.msg || '请求失败');
      if (data.code === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      }
      return Promise.reject(new Error(data.msg));
    }
    return data;
  },
  (err) => {
    const msg = err.response?.data?.msg || err.message || '网络错误';
    ElMessage.error(msg);
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    }
    return Promise.reject(err);
  }
);

export default request;
