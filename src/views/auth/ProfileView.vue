<template>
  <div class="row justify-content-center mt-4">
    <div class="col-md-6">
      <div class="card shadow">
        <div class="card-body p-4">
          <h2 class="mb-4">Мой профиль</h2>

          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary"></div>
          </div>

          <div v-else>
            <div class="alert alert-success" v-if="updateSuccess">
              Данные обновлены
            </div>
            <div class="alert alert-danger" v-if="updateError">
              {{ updateError }}
            </div>

            <form @submit.prevent="updateProfile">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Имя</label>
                  <input
                    v-model="profile.name"
                    type="text"
                    class="form-control"
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Фамилия</label>
                  <input
                    v-model="profile.surname"
                    type="text"
                    class="form-control"
                  />
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Телефон</label>
                <input
                  v-model="profile.phone"
                  type="tel"
                  class="form-control"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input
                  :value="user?.email"
                  type="email"
                  class="form-control"
                  disabled
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Роль</label>
                <input
                  :value="user?.roleType?.name || user?.role"
                  type="text"
                  class="form-control"
                  disabled
                />
              </div>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="updating"
              >
                {{ updating ? 'Сохранение...' : 'Сохранить изменения' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { useUserStore } from '@/stores/userStore';
import { onMounted, ref } from 'vue';

const userStore = useUserStore();
const user = ref<any>(null);
const profile = ref({ name: '', surname: '', phone: '' });
const loading = ref(true);
const updating = ref(false);
const updateSuccess = ref(false);
const updateError = ref('');

onMounted(async () => {
  try {
    const res = await client.get('/auth/me');
    user.value = res.data;
    profile.value = {
      name: res.data.name || '',
      surname: res.data.surname || '',
      phone: res.data.phone || '',
    };
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});

const updateProfile = async () => {
  updating.value = true;
  updateSuccess.value = false;
  updateError.value = '';

  try {
    const res = await client.patch('/auth/update-user', profile.value);
    user.value = res.data;
    userStore.setUser(res.data);
    updateSuccess.value = true;
    setTimeout(() => (updateSuccess.value = false), 3000);
  } catch (err: any) {
    updateError.value = err.response?.data?.message || 'Ошибка обновления';
  } finally {
    updating.value = false;
  }
};
</script>
