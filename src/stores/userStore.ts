import { authApi } from '@/api/library';
import type { LoginPayload, RegisterPayload, User } from '@/types/library';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

const TOKEN_KEY = 'token';

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const isAuthenticated = ref(Boolean(localStorage.getItem(TOKEN_KEY)));
  const isBootstrapped = ref(false);

  const role = computed(() => user.value?.roleType?.name ?? null);
  const isAdmin = computed(() => role.value === 'admin');
  const isUser = computed(() => role.value === 'user');

  const setUser = (userData: User) => {
    user.value = userData;
    isAuthenticated.value = true;
  };

  const setToken = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    isAuthenticated.value = true;
  };

  const clear = () => {
    user.value = null;
    isAuthenticated.value = false;
    isBootstrapped.value = true;
    localStorage.removeItem(TOKEN_KEY);
  };

  const loadMe = async () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      clear();
      return null;
    }

    const profile = await authApi.me();
    setUser(profile);
    isBootstrapped.value = true;
    return profile;
  };

  const login = async (payload: LoginPayload) => {
    const response = await authApi.login(payload);
    setToken(response.access_token);
    return loadMe();
  };

  const register = async (payload: RegisterPayload) => {
    const response = await authApi.register(payload);
    setToken(response.access_token);
    return loadMe();
  };

  return {
    user,
    isAuthenticated,
    isBootstrapped,
    role,
    isAdmin,
    isUser,
    setUser,
    setToken,
    clear,
    loadMe,
    login,
    register,
  };
});
