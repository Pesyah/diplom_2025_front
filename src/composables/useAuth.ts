import { useUserStore } from '@/stores/userStore';
import type { LoginPayload } from '@/types/library';
import { useRouter } from 'vue-router';

export const useAuth = () => {
  const userStore = useUserStore();
  const router = useRouter();

  const login = async (payload: LoginPayload) => {
    await userStore.login(payload);
    await router.push('/catalog');
  };

  const logout = async () => {
    userStore.clear();
    await router.push('/login');
  };

  return {
    login,
    logout,
    user: userStore.user,
    isAuthenticated: userStore.isAuthenticated,
  };
};
