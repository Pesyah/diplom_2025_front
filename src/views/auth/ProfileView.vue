<template>
  <section class="page-band">
    <div class="container-xxl">
      <div class="toolbar-panel">
        <div>
          <span class="eyebrow">Аккаунт</span>
          <h1>Профиль</h1>
        </div>
        <span class="pill">{{ user?.roleType?.name || 'user' }}</span>
      </div>

      <div v-if="notice" class="alert alert-success">{{ notice }}</div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <div class="profile-grid">
        <form class="form-panel" @submit.prevent="updateProfile">
          <span class="eyebrow">Данные</span>
          <h2>Контакты</h2>

          <div class="split-fields">
            <div>
              <label class="form-label">Имя</label>
              <input v-model.trim="profile.name" class="form-control" required />
            </div>
            <div>
              <label class="form-label">Фамилия</label>
              <input v-model.trim="profile.surname" class="form-control" required />
            </div>
          </div>

          <label class="form-label">Телефон</label>
          <input v-model.trim="profile.phone" class="form-control" required />

          <label class="form-label">Email</label>
          <input :value="user?.email" class="form-control" disabled />

          <button class="btn btn-primary-soft w-100" type="submit" :disabled="saving">
            {{ saving ? 'Сохраняем...' : 'Сохранить профиль' }}
          </button>
        </form>

        <form class="form-panel" @submit.prevent="changePassword">
          <span class="eyebrow">Безопасность</span>
          <h2>Смена пароля</h2>

          <label class="form-label">Старый пароль</label>
          <input
            v-model="passwords.oldPassword"
            class="form-control"
            type="password"
            required
          />

          <label class="form-label">Новый пароль</label>
          <input
            v-model="passwords.newPassword"
            class="form-control"
            minlength="6"
            type="password"
            required
          />

          <button class="btn btn-secondary-soft w-100" type="submit" :disabled="saving">
            Обновить пароль
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { authApi } from '@/api/library';
import { useUserStore } from '@/stores/userStore';
import { getApiErrorMessage, showSuccessMessage } from '@/utils/errors';
import { computed, onMounted, ref } from 'vue';

const userStore = useUserStore();
const user = computed(() => userStore.user);
const saving = ref(false);
const error = ref('');
const notice = ref('');
const profile = ref({
  name: '',
  surname: '',
  phone: '',
});
const passwords = ref({
  oldPassword: '',
  newPassword: '',
});

const fillProfile = () => {
  profile.value = {
    name: user.value?.name ?? '',
    surname: user.value?.surname ?? '',
    phone: user.value?.phone ?? '',
  };
};

const updateProfile = async () => {
  saving.value = true;
  error.value = '';
  notice.value = '';

  try {
    const updated = await authApi.updateUser(profile.value);
    userStore.setUser(updated);
    showSuccessMessage('Профиль обновлен.');
    notice.value = '';
  } catch (updateError) {
    error.value = getApiErrorMessage(updateError, 'Не удалось обновить профиль');
  } finally {
    saving.value = false;
  }
};

const changePassword = async () => {
  saving.value = true;
  error.value = '';
  notice.value = '';

  try {
    await authApi.changePassword(
      passwords.value.oldPassword,
      passwords.value.newPassword,
    );
    passwords.value = { oldPassword: '', newPassword: '' };
    showSuccessMessage('Пароль обновлен.');
    notice.value = '';
  } catch (passwordError) {
    error.value = getApiErrorMessage(passwordError, 'Не удалось изменить пароль');
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  if (!userStore.user) {
    await userStore.loadMe();
  }
  fillProfile();
});
</script>
