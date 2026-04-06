// src/composables/useAuth.ts
import client from '@/api/client';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';

export const useAuth = () => {
  const userStore = useUserStore();
  const router = useRouter();

  const login = async (email: string, password: string) => {
    const res = await client.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.access_token);

    // Получаем данные пользователя
    const userRes = await client.get('/auth/me');
    userStore.setUser(userRes.data);

    router.push('/');
  };

  const logout = () => {
    userStore.clear();
    router.push('/login');
  };

  return { login, logout, user: userStore.user };
};
