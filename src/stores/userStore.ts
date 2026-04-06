import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const user = ref<any>(null);
  const isAuthenticated = ref(!!localStorage.getItem('token'));

  const setUser = (userData: any) => {
    console.log('Setting user:', userData); // Отладка
    user.value = userData;
    isAuthenticated.value = true;
  };

  const clear = () => {
    user.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem('token');
  };

  const role = computed(() => {
    return user.value?.roleType?.name || user.value?.role || null;
  });

  return { user, isAuthenticated, role, setUser, clear };
});
