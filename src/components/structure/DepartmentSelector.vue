<template>
  <div class="mb-3">
    <label class="form-label">{{ label }}</label>
    <input
      type="text"
      class="form-control"
      :placeholder="placeholder"
      v-model="search"
      @input="onSearchInput"
    />
    <div v-if="loading" class="text-muted small mt-1">Поиск...</div>
    <div
      v-if="items.length"
      class="list-group mt-1"
      style="max-height: 200px; overflow-y: auto"
    >
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        class="list-group-item list-group-item-action"
        @click="selectItem(item)"
      >
        {{ item.name }}
      </button>
    </div>
    <div v-if="selected" class="mt-2 alert alert-success py-1 px-2 small">
      Выбрано: {{ selected.name }}
      <button
        type="button"
        class="btn-close float-end"
        @click="clearSelection"
      ></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { structureApi, type Department } from '@/api/structure';
import { debounce } from 'lodash-es';
import { ref, watch } from 'vue';

const props = defineProps<{
  label?: string;
  placeholder?: string;
  modelValue?: Department | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: Department | null): void;
}>();

const search = ref('');
const items = ref<Department[]>([]);
const loading = ref(false);
const selected = ref<Department | null>(props.modelValue || null);

watch(
  () => props.modelValue,
  (val) => {
    selected.value = val || null;
  },
);

const fetchDepartments = async (query: string) => {
  if (!query.trim()) {
    items.value = [];
    return;
  }
  loading.value = true;
  try {
    const res = await structureApi.getDepartments(query);
    items.value = res.data;
  } catch (err) {
    console.error(err);
    items.value = [];
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = debounce(fetchDepartments, 300);

const onSearchInput = () => {
  debouncedFetch(search.value);
};

const selectItem = (item: Department) => {
  selected.value = item;
  emit('update:modelValue', item);
  items.value = [];
  search.value = '';
};

const clearSelection = () => {
  selected.value = null;
  emit('update:modelValue', null);
};
</script>
