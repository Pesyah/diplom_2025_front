<!-- src/views/admin/AdminCoffeeRelationsView.vue -->
<template>
  <div class="container py-4">
    <h1 class="fw-bold mb-4" style="color: #4a3f6b">🔗 Связи кофе</h1>

    <!-- Табы -->
    <ul class="nav nav-pills mb-4 gap-2">
      <li class="nav-item">
        <button class="nav-link tab-btn" :class="{ active: activeTab === 'volume' }" @click="activeTab = 'volume'">Кофе ↔ Объем</button>
      </li>
      <li class="nav-item">
        <button class="nav-link tab-btn" :class="{ active: activeTab === 'additive' }" @click="activeTab = 'additive'">Объем ↔ Добавка</button>
      </li>
    </ul>

    <!-- Связи кофе-объем -->
    <div v-if="activeTab === 'volume'">
      <button class="btn add-new-btn mb-3" @click="openVolumeRelationModal">+ Создать связь</button>

      <div v-if="loading" class="text-center py-5"><div class="spinner-border"></div></div>
      <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

      <div v-else class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr><th>ID</th><th>Кофе</th><th>Объем</th><th>Цена</th><th>Действия</th></tr>
          </thead>
          <tbody>
            <tr v-for="rel in volumeRelations" :key="rel.id">
              <td>{{ rel.id }}</td>
              <td>{{ rel.coffee?.name }}</td>
              <td>{{ rel.coffeeVolume?.name }}</td>
              <td class="fw-bold" style="color: #4a3f6b">{{ Number(rel.price).toFixed(2) }} ₽</td>
              <td>
                <button class="btn btn-sm edit-btn me-1" @click="openEditVolumeRelationModal(rel)">✏️</button>
                <button class="btn btn-sm delete-btn" @click="deleteVolumeRelation(rel.id)">🗑</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Связи объем-добавка -->
    <div v-else>
      <button class="btn add-new-btn mb-3" @click="openAdditiveRelationModal">+ Создать связь</button>

      <div v-if="loading" class="text-center py-5"><div class="spinner-border"></div></div>
      <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

      <div v-else class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr><th>ID</th><th>Кофе</th><th>Объем</th><th>Добавка</th><th>Цена</th><th>Действия</th></tr>
          </thead>
          <tbody>
            <tr v-for="rel in additiveRelations" :key="rel.id">
              <td>{{ rel.id }}</td>
              <td>{{ rel.coffeeVolumeRelation?.coffee?.name }}</td>
              <td>{{ rel.coffeeVolumeRelation?.coffeeVolume?.name }}</td>
              <td>{{ rel.coffeeAdditive?.name }}</td>
              <td class="fw-bold" style="color: #4a3f6b">{{ Number(rel.price).toFixed(2) }} ₽</td>
              <td>
                <button class="btn btn-sm edit-btn me-1" @click="openEditAdditiveRelationModal(rel)">✏️</button>
                <button class="btn btn-sm delete-btn" @click="deleteAdditiveRelation(rel.id)">🗑</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Модалка связи кофе-объем -->
    <div class="modal fade" id="volumeRelationModal" ref="volumeRelationModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header" style="background-color: #4a3f6b; color: #fff; border-radius: 16px 16px 0 0">
            <h5 class="modal-title">{{ editingVolumeRelation ? 'Редактировать связь' : 'Новая связь кофе-объем' }}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3" v-if="!editingVolumeRelation">
              <label class="form-label">Кофе</label>
              <select v-model="volumeForm.coffeeId" class="form-select" style="border-color: #c4b5e3">
                <option value="">Выберите...</option>
                <option v-for="c in coffeeList" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div class="mb-3" v-if="!editingVolumeRelation">
              <label class="form-label">Объем</label>
              <select v-model="volumeForm.coffeeVolumeId" class="form-select" style="border-color: #c4b5e3">
                <option :value="0">Выберите...</option>
                <option v-for="v in volumes" :key="v.id" :value="v.id">{{ v.name }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Цена</label>
              <input v-model.number="volumeForm.price" type="number" step="0.01" class="form-control" style="border-color: #c4b5e3" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn" style="background-color: #e8dff5; color: #4a3f6b" data-bs-dismiss="modal">Отмена</button>
            <button class="btn" style="background-color: #4a3f6b; color: #fff" @click="saveVolumeRelation" :disabled="saving">Сохранить</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка связи объем-добавка -->
    <div class="modal fade" id="additiveRelationModal" ref="additiveRelationModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header" style="background-color: #4a3f6b; color: #fff; border-radius: 16px 16px 0 0">
            <h5 class="modal-title">{{ editingAdditiveRelation ? 'Редактировать связь' : 'Новая связь объем-добавка' }}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3" v-if="!editingAdditiveRelation">
              <label class="form-label">Связь кофе-объем</label>
              <select v-model="additiveForm.coffeeVolumeRelationId" class="form-select" style="border-color: #c4b5e3">
                <option :value="0">Выберите...</option>
                <option v-for="vr in volumeRelations" :key="vr.id" :value="vr.id">
                  {{ vr.coffee?.name }} — {{ vr.coffeeVolume?.name }}
                </option>
              </select>
            </div>
            <div class="mb-3" v-if="!editingAdditiveRelation">
              <label class="form-label">Добавка</label>
              <select v-model="additiveForm.coffeeAdditiveId" class="form-select" style="border-color: #c4b5e3">
                <option :value="0">Выберите...</option>
                <option v-for="a in additives" :key="a.id" :value="a.id">{{ a.name }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Цена</label>
              <input v-model.number="additiveForm.price" type="number" step="0.01" class="form-control" style="border-color: #c4b5e3" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn" style="background-color: #e8dff5; color: #4a3f6b" data-bs-dismiss="modal">Отмена</button>
            <button class="btn" style="background-color: #4a3f6b; color: #fff" @click="saveAdditiveRelation" :disabled="saving">Сохранить</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { Modal } from 'bootstrap';
import { onMounted, ref } from 'vue';

const activeTab = ref<'volume' | 'additive'>('volume');
const loading = ref(true);
const error = ref('');
const saving = ref(false);

const volumeRelations = ref<any[]>([]);
const additiveRelations = ref<any[]>([]);
const coffeeList = ref<any[]>([]);
const volumes = ref<any[]>([]);
const additives = ref<any[]>([]);

const editingVolumeRelation = ref<any>(null);
const editingAdditiveRelation = ref<any>(null);

const volumeRelationModalRef = ref<HTMLElement | null>(null);
const additiveRelationModalRef = ref<HTMLElement | null>(null);
let volumeModalInstance: Modal | null = null;
let additiveModalInstance: Modal | null = null;

const volumeForm = ref({ coffeeId: '', coffeeVolumeId: 0, price: 0 });
const additiveForm = ref({ coffeeVolumeRelationId: 0, coffeeAdditiveId: 0, price: 0 });

const loadData = async () => {
  loading.value = true;
  error.value = '';
  try {
    const [vr, ar, c, v, a] = await Promise.all([
      client.get('/coffee/coffee-volume/admin/all'),
      client.get('/coffee/coffee-additive/admin/all'),
      client.get('/coffee/admin/all'),
      client.get('/coffee-volume/admin/all'),
      client.get('/coffee-additive/admin/all'),
    ]);
    volumeRelations.value = vr.data;
    additiveRelations.value = ar.data;
    coffeeList.value = c.data.filter((co: any) => !co.deleted_at);
    volumes.value = v.data;
    additives.value = a.data;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка загрузки';
  } finally {
    loading.value = false;
  }
};

const openVolumeRelationModal = () => {
  editingVolumeRelation.value = null;
  volumeForm.value = { coffeeId: '', coffeeVolumeId: 0, price: 0 };
  volumeModalInstance?.show();
};

const openEditVolumeRelationModal = (rel: any) => {
  editingVolumeRelation.value = rel;
  volumeForm.value = { coffeeId: '', coffeeVolumeId: 0, price: Number(rel.price) };
  volumeModalInstance?.show();
};

const saveVolumeRelation = async () => {
  saving.value = true;
  try {
    if (editingVolumeRelation.value) {
      await client.patch('/coffee/coffee-volume/admin', {
        id: editingVolumeRelation.value.id,
        price: volumeForm.value.price,
      });
    } else {
      await client.post('/coffee/coffee-volume/admin', {
        coffeeId: volumeForm.value.coffeeId,
        coffeeVolumeId: volumeForm.value.coffeeVolumeId,
        price: volumeForm.value.price,
      });
    }
    volumeModalInstance?.hide();
    await loadData();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка';
  } finally {
    saving.value = false;
  }
};

const deleteVolumeRelation = async (id: number) => {
  if (!confirm('Удалить связь?')) return;
  try {
    await client.delete(`/coffee/coffee-volume/admin/${id}`);
    await loadData();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка';
  }
};

const openAdditiveRelationModal = () => {
  editingAdditiveRelation.value = null;
  additiveForm.value = { coffeeVolumeRelationId: 0, coffeeAdditiveId: 0, price: 0 };
  additiveModalInstance?.show();
};

const openEditAdditiveRelationModal = (rel: any) => {
  editingAdditiveRelation.value = rel;
  additiveForm.value = { coffeeVolumeRelationId: 0, coffeeAdditiveId: 0, price: Number(rel.price) };
  additiveModalInstance?.show();
};

const saveAdditiveRelation = async () => {
  saving.value = true;
  try {
    if (editingAdditiveRelation.value) {
      await client.patch('/coffee/coffee-additive/admin', {
        id: editingAdditiveRelation.value.id,
        price: additiveForm.value.price,
      });
    } else {
      await client.post('/coffee/coffee-additive/admin', {
        coffeeVolumeRelationId: additiveForm.value.coffeeVolumeRelationId,
        coffeeAdditiveId: additiveForm.value.coffeeAdditiveId,
        price: additiveForm.value.price,
      });
    }
    additiveModalInstance?.hide();
    await loadData();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка';
  } finally {
    saving.value = false;
  }
};

const deleteAdditiveRelation = async (id: number) => {
  if (!confirm('Удалить связь?')) return;
  try {
    await client.delete(`/coffee/coffee-additive/admin/${id}`);
    await loadData();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка';
  }
};

onMounted(() => {
  loadData();
  if (volumeRelationModalRef.value) volumeModalInstance = new Modal(volumeRelationModalRef.value);
  if (additiveRelationModalRef.value) additiveModalInstance = new Modal(additiveRelationModalRef.value);
});
</script>

<style scoped>
.tab-btn {
  border-radius: 20px !important;
  padding: 0.5rem 1.5rem !important;
  color: #4a3f6b !important;
  border: 2px solid #c4b5e3 !important;
  font-weight: 500;
  background-color: transparent;
}
.tab-btn.active {
  background-color: #4a3f6b !important;
  color: #fff !important;
  border-color: #4a3f6b !important;
}
.add-new-btn { background-color: #4a3f6b; color: #fff; border-radius: 20px; padding: 0.4rem 1.2rem; border: none; }
.add-new-btn:hover { background-color: #5c4f82; }
.edit-btn { background-color: #e8dff5; color: #4a3f6b; border: none; border-radius: 8px; }
.edit-btn:hover { background-color: #c4b5e3; }
.delete-btn { background-color: #fde8e8; color: #e74c3c; border: none; border-radius: 8px; }
.delete-btn:hover { background-color: #f5c6cb; }
.modal-content { border-radius: 16px; border: none; box-shadow: 0 16px 40px rgba(74,63,107,0.25); }
</style>