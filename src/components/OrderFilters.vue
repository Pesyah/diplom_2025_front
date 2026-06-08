<template>
  <div class="order-filters">
    <div class="d-flex flex-wrap gap-2 align-items-center mb-3">
      <button
        type="button"
        class="btn btn-sm btn-outline-primary"
        @click="openModal('price')"
      >
        Цена
        <span v-if="hasPriceFilter" class="badge bg-secondary ms-2">{{
          priceBadge
        }}</span>
      </button>

      <button
        type="button"
        class="btn btn-sm btn-outline-primary"
        @click="openModal('date')"
      >
        Дата
        <span v-if="hasDateFilter" class="badge bg-secondary ms-2">{{
          dateBadge
        }}</span>
      </button>

      <button
        type="button"
        class="btn btn-sm btn-outline-primary"
        @click="openModal('status')"
      >
        Статус
        <span
          v-if="localFilters.statuses.length"
          class="badge bg-secondary ms-2"
        >
          {{ localFilters.statuses.length }}
        </span>
      </button>

      <button
        type="button"
        class="btn btn-sm btn-outline-secondary ms-auto"
        @click="clearAllImmediate"
        v-if="hasAnyFilter"
      >
        Сбросить фильтры
      </button>
    </div>

    <div
      v-if="showModal"
      class="filter-modal-backdrop"
      @click.self="closeModal"
    >
      <div class="filter-modal shadow-sm">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h5 class="mb-0">{{ sectionTitle }}</h5>
          <button
            type="button"
            class="btn-close"
            aria-label="Закрыть"
            @click="closeModal"
          ></button>
        </div>

        <div class="row g-3">
          <template v-if="selectedSection === 'price'">
            <div class="col-12">
              <div class="mb-2 text-muted small">Цена</div>
              <input
                type="number"
                :min="priceMin ?? 0"
                :max="priceMax ?? 999999"
                step="0.01"
                class="form-control mb-2"
                v-model="localFilters.priceFrom"
                placeholder="Цена от"
              />
              <input
                type="number"
                :min="priceMin ?? 0"
                :max="priceMax ?? 999999"
                step="0.01"
                class="form-control"
                v-model="localFilters.priceTo"
                placeholder="Цена до"
              />
              <div
                v-if="priceMin !== null && priceMax !== null"
                class="text-muted small mt-1"
              >
                Диапазон: {{ priceMin }} — {{ priceMax }}
              </div>
            </div>
          </template>

          <template v-else-if="selectedSection === 'date'">
            <div class="col-12">
              <div class="mb-2 text-muted small">Дата</div>
              <input
                type="date"
                :min="dateMin"
                :max="dateMax"
                class="form-control mb-2"
                v-model="localFilters.dateFrom"
              />
              <input
                type="date"
                :min="dateMin"
                :max="dateMax"
                class="form-control"
                v-model="localFilters.dateTo"
              />
              <div v-if="dateMin && dateMax" class="text-muted small mt-1">
                Диапазон: {{ dateMin }} — {{ dateMax }}
              </div>
            </div>
          </template>

          <template v-else-if="selectedSection === 'status'">
            <div class="col-12">
              <div class="mb-2 text-muted small">Статусы</div>
              <div class="status-list row g-2">
                <div
                  class="col-6 col-md-4"
                  v-for="status in statuses"
                  :key="status.id"
                >
                  <label class="form-check form-switch w-100">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :value="status.id"
                      v-model="localFilters.statuses"
                    />
                    <span class="form-check-label">{{ status.name }}</span>
                  </label>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-4">
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm"
            @click="clearModal"
          >
            Сбросить все
          </button>
          <button
            type="button"
            class="btn btn-primary btn-sm"
            @click="applyFilters"
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, ref, watch } from 'vue';

type FilterState = {
  priceFrom: string;
  priceTo: string;
  dateFrom: string;
  dateTo: string;
  statuses: number[];
};

const props = defineProps<{
  modelValue: FilterState;
  statuses: Array<{ id: number; name: string }>;
  priceMin: number | null;
  priceMax: number | null;
  dateMin: string;
  dateMax: string;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: FilterState): void;
}>();

const localFilters = ref<FilterState>({
  priceFrom: props.modelValue.priceFrom || '',
  priceTo: props.modelValue.priceTo || '',
  dateFrom: props.modelValue.dateFrom || '',
  dateTo: props.modelValue.dateTo || '',
  statuses: [...(props.modelValue.statuses || [])],
});

const selectedSection = ref<'price' | 'date' | 'status' | null>(null);
const showModal = computed(() => selectedSection.value !== null);

const sectionTitle = computed(() => {
  switch (selectedSection.value) {
    case 'price':
      return 'Фильтр по цене';
    case 'date':
      return 'Фильтр по дате';
    case 'status':
      return 'Фильтр по статусу';
    default:
      return 'Фильтры заказов';
  }
});

const loadFilters = (value: FilterState) => {
  localFilters.value = {
    priceFrom: value.priceFrom ?? '',
    priceTo: value.priceTo ?? '',
    dateFrom: value.dateFrom ?? '',
    dateTo: value.dateTo ?? '',
    statuses: [...(value.statuses ?? [])],
  };
};

watch(
  () => props.modelValue,
  (value) => {
    if (selectedSection.value === null) {
      loadFilters(value);
    }
  },
  { deep: true, immediate: true },
);

const openModal = (section: 'price' | 'date' | 'status') => {
  loadFilters(props.modelValue);
  selectedSection.value = section;
};

const applyFilters = () => {
  emit('update:modelValue', {
    priceFrom: localFilters.value.priceFrom,
    priceTo: localFilters.value.priceTo,
    dateFrom: localFilters.value.dateFrom,
    dateTo: localFilters.value.dateTo,
    statuses: [...localFilters.value.statuses],
  });
  selectedSection.value = null;
};

const clearModal = () => {
  localFilters.value = {
    priceFrom: '',
    priceTo: '',
    dateFrom: '',
    dateTo: '',
    statuses: [],
  };
};

const clearAllImmediate = () => {
  const empty = {
    priceFrom: '',
    priceTo: '',
    dateFrom: '',
    dateTo: '',
    statuses: [] as number[],
  };
  loadFilters(empty);
  emit('update:modelValue', empty);
};

const closeModal = () => {
  selectedSection.value = null;
};

const hasPriceFilter = computed(
  () =>
    localFilters.value.priceFrom !== '' || localFilters.value.priceTo !== '',
);
const hasDateFilter = computed(
  () => localFilters.value.dateFrom !== '' || localFilters.value.dateTo !== '',
);
const hasAnyFilter = computed(
  () =>
    hasPriceFilter.value ||
    hasDateFilter.value ||
    localFilters.value.statuses.length > 0,
);

const priceBadge = computed(() => {
  if (localFilters.value.priceFrom && localFilters.value.priceTo) {
    return `${localFilters.value.priceFrom}–${localFilters.value.priceTo}`;
  }
  if (localFilters.value.priceFrom) {
    return `от ${localFilters.value.priceFrom}`;
  }
  if (localFilters.value.priceTo) {
    return `до ${localFilters.value.priceTo}`;
  }
  return '';
});

const dateBadge = computed(() => {
  if (localFilters.value.dateFrom && localFilters.value.dateTo) {
    return `${localFilters.value.dateFrom}–${localFilters.value.dateTo}`;
  }
  if (localFilters.value.dateFrom) {
    return `от ${localFilters.value.dateFrom}`;
  }
  if (localFilters.value.dateTo) {
    return `до ${localFilters.value.dateTo}`;
  }
  return '';
});
</script>

<style scoped>
.order-filters {
  background: #fff;
  border: 1px solid #e8dff5;
  border-radius: 20px;
  padding: 18px;
  margin-bottom: 24px;
}
.filter-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1050;
}
.filter-modal {
  width: min(100%, 760px);
  background: #fff;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 24px 80px rgba(74, 63, 107, 0.18);
}
.btn-close {
  position: relative;
  width: 34px;
  height: 34px;
  border: none;
  background: transparent;
  cursor: pointer;
}
.btn-close::before,
.btn-close::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 2px;
  background: #4a3f6b;
}
.btn-close::before {
  transform: translate(-50%, -50%) rotate(45deg);
}
.btn-close::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}
.status-list {
  background: #f8f2ff;
  padding: 16px;
  border-radius: 16px;
}
</style>
