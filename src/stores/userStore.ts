// stores/userStore.ts
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const user = ref<any>(null);
  const isAuthenticated = ref(!!localStorage.getItem('token'));

  const setUser = (userData: any) => {
    console.log('Setting user:', userData);
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

  const isAdmin = computed(() => role.value === 'admin');

  const isElder = computed(() => {
    return user.value?.isElder === true;
  });

  const userGroup = computed(() => {
    return user.value?.group || null;
  });

  const userDepartment = computed(() => {
    return user.value?.department || null;
  });

  const userFaculty = computed(() => {
    return user.value?.faculty || null;
  });

  return {
    user,
    isAuthenticated,
    role,
    isAdmin,
    isElder,
    userGroup,
    userDepartment,
    userFaculty,
    setUser,
    clear,
  };
});
