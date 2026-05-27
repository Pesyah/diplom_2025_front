<template>
  <div class="container-fluid py-4">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <h2 class="mb-0" style="color: #4c4993">📈 Отчеты</h2>
      <button
        class="btn"
        style="background-color: #4c4993; color: #fff"
        :disabled="loading"
        @click="fetchReport"
      >
        {{ loading ? 'Формируем...' : 'Сформировать' }}
      </button>
      <button
        class="btn btn-outline-secondary"
        :disabled="pdfLoading"
        @click="downloadPdf"
      >
        {{ pdfLoading ? 'Скачиваем...' : 'Скачать PDF' }}
      </button>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-lg-5">
            <label class="form-label fw-semibold">Комнаты</label>
            <div class="rooms-filter border rounded p-3">
              <div class="form-check mb-2">
                <input
                  id="all-rooms"
                  class="form-check-input"
                  type="checkbox"
                  :checked="selectedRoomIds.length === 0"
                  @change="selectedRoomIds = []"
                />
                <label class="form-check-label" for="all-rooms">Все комнаты</label>
              </div>
              <div v-for="room in rooms" :key="room.id" class="form-check">
                <input
                  :id="`room-${room.id}`"
                  v-model="selectedRoomIds"
                  class="form-check-input"
                  type="checkbox"
                  :value="room.id"
                />
                <label class="form-check-label" :for="`room-${room.id}`">
                  № {{ room.roomNumber }}
                  <span class="text-muted">({{ room.roomsType?.name || 'тип не указан' }})</span>
                </label>
              </div>
            </div>
          </div>

          <div class="col-lg-7">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold">Дата с</label>
                <input v-model="dateFrom" type="date" class="form-control" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Дата по</label>
                <input v-model="dateTo" type="date" class="form-control" />
              </div>
              <div class="col-12">
                <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                  <label class="form-label fw-semibold mb-0">Статусы брони</label>
                  <div class="d-flex flex-wrap gap-2">
                    <button class="btn btn-outline-secondary btn-sm" @click="selectDefaultStatuses">
                      Все кроме отмененных
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" @click="selectAllStatuses">
                      Все статусы
                    </button>
                  </div>
                </div>
                <div class="status-filter border rounded p-3">
                  <div
                    v-for="status in availableStatuses"
                    :key="status.id"
                    class="form-check"
                  >
                    <input
                      :id="`status-${status.id}`"
                      v-model="selectedStatusIds"
                      class="form-check-input"
                      type="checkbox"
                      :value="status.id"
                    />
                    <label class="form-check-label" :for="`status-${status.id}`">
                      {{ status.name }}
                    </label>
                  </div>
                  <div v-if="availableStatuses.length === 0" class="text-muted">
                    Статусы загрузятся после первого формирования отчета
                  </div>
                </div>
              </div>
              <div class="col-12 d-flex flex-wrap gap-2">
                <button class="btn btn-outline-secondary btn-sm" @click="setCurrentMonth">
                  Текущий месяц
                </button>
                <button class="btn btn-outline-secondary btn-sm" @click="setYearToToday">
                  С января по сегодня
                </button>
                <button class="btn btn-outline-secondary btn-sm" @click="dateTo = today">
                  Конечная сегодня
                </button>
                <button class="btn btn-outline-danger btn-sm" @click="resetFilters">
                  Сбросить
                </button>
              </div>
              <div class="col-12 text-muted small">
                Даты можно указывать по одной. Если поставить их в обратном порядке,
                сервер сам построит корректный период.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template v-if="report">
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card shadow-sm p-3 text-center" style="background-color: #a1cdc4; color: #1a3c34">
            <div class="fs-2 fw-bold">{{ report.summary.roomsCount }}</div>
            <div>Комнат</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow-sm p-3 text-center" style="background-color: #bfc9ed; color: #2d2640">
            <div class="fs-2 fw-bold">{{ report.summary.reservationsCount }}</div>
            <div>Броней</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow-sm p-3 text-center" style="background-color: #f5f0eb; color: #856404">
            <div class="fs-2 fw-bold">{{ report.summary.nights }}</div>
            <div>Ночей</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow-sm p-3 text-center" style="background-color: #fde8e8; color: #c0392b">
            <div class="fs-2 fw-bold">{{ formatMoney(report.summary.revenue) }}</div>
            <div>Выручка</div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-xl-6">
          <ReportTable title="По комнатам" empty-text="Нет комнат для отчета" :rows="report.byRooms" />
        </div>
        <div class="col-xl-6">
          <ReportTable title="По месяцам" empty-text="Нет данных по месяцам" :rows="report.byMonths" />
        </div>
      </div>

      <div class="card shadow-sm mt-4">
        <div class="card-header fw-semibold" style="background-color: #4c4993; color: #fff">
          Брони в отчете
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th class="ps-3">Комната</th>
                  <th>Гость</th>
                  <th>Период брони</th>
                  <th>Ночей в отчете</th>
                  <th>Статус</th>
                  <th class="text-end pe-3">Выручка</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="reservation in report.reservations" :key="reservation.id">
                  <td class="ps-3">№ {{ reservation.roomNumber }}</td>
                  <td>{{ reservation.guestName || 'Не указан' }}</td>
                  <td>
                    {{ formatDate(reservation.checkInDate) }} -
                    {{ formatDate(reservation.checkOutDate) }}
                  </td>
                  <td>{{ reservation.nightsInPeriod }}</td>
                  <td>{{ reservation.statusName }}</td>
                  <td class="text-end pe-3">{{ formatMoney(reservation.revenueInPeriod) }}</td>
                </tr>
                <tr v-if="report.reservations.length === 0">
                  <td colspan="6" class="text-center py-4 text-muted">
                    По выбранным фильтрам броней нет
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { useUserStore } from '@/stores/userStore';
import { computed, defineComponent, h, onMounted, ref } from 'vue';

interface Room {
  id: string;
  roomNumber: string;
  roomsType: { name: string } | null;
}

interface ReportGroup {
  key: string;
  label: string;
  reservationsCount: number;
  nights: number;
  revenue: number;
  averageDailyRate: number;
}

interface ReportReservation {
  id: string;
  roomNumber: string;
  guestName: string;
  statusName: string;
  checkInDate: string;
  checkOutDate: string;
  nightsInPeriod: number;
  revenueInPeriod: number;
}

interface ReportStatus {
  id: number;
  name: string;
}

interface RoomsReport {
  filters: {
    roomIds: string[];
    statusIds: number[];
    dateFrom: string | null;
    dateTo: string | null;
  };
  availableStatuses: ReportStatus[];
  summary: {
    roomsCount: number;
    reservationsCount: number;
    nights: number;
    revenue: number;
    averageDailyRate: number;
  };
  byRooms: ReportGroup[];
  byMonths: ReportGroup[];
  reservations: ReportReservation[];
}

const userStore = useUserStore();
const isAdmin = computed(() => userStore.user?.roleType?.name === 'admin');

const rooms = ref<Room[]>([]);
const selectedRoomIds = ref<string[]>([]);
const selectedStatusIds = ref<number[]>([]);
const availableStatuses = ref<ReportStatus[]>([]);
const dateFrom = ref('');
const dateTo = ref('');
const report = ref<RoomsReport | null>(null);
const loading = ref(false);
const pdfLoading = ref(false);
const error = ref('');

const toInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const today = toInputDate(new Date());
const CANCELLED_STATUS_ID = 5;

const defaultStatusIds = computed(() =>
  availableStatuses.value
    .filter((status) => status.id !== CANCELLED_STATUS_ID)
    .map((status) => status.id),
);

const formatMoney = (value: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string) => new Date(value).toLocaleDateString('ru-RU');

const setCurrentMonth = () => {
  const now = new Date();
  dateFrom.value = toInputDate(new Date(now.getFullYear(), now.getMonth(), 1));
  dateTo.value = today;
};

const setYearToToday = () => {
  const now = new Date();
  dateFrom.value = toInputDate(new Date(now.getFullYear(), 0, 1));
  dateTo.value = today;
};

const selectDefaultStatuses = () => {
  selectedStatusIds.value = [...defaultStatusIds.value];
};

const selectAllStatuses = () => {
  selectedStatusIds.value = availableStatuses.value.map((status) => status.id);
};

const resetFilters = () => {
  selectedRoomIds.value = [];
  selectDefaultStatuses();
  dateFrom.value = '';
  dateTo.value = '';
  fetchReport();
};

const fetchRooms = async () => {
  const res = await client.get<Room[]>(isAdmin.value ? '/rooms/all-admin' : '/rooms/all');
  rooms.value = res.data;
};

const fetchReport = async () => {
  if (availableStatuses.value.length > 0 && selectedStatusIds.value.length === 0) {
    error.value = 'Выберите хотя бы один статус брони';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const res = await client.get<RoomsReport>('/reports/rooms', {
      params: buildReportParams(),
    });
    report.value = res.data;
    availableStatuses.value = res.data.availableStatuses;

    if (selectedStatusIds.value.length === 0) {
      selectedStatusIds.value = [...res.data.filters.statusIds];
    }
  } catch (err) {
    error.value = 'Не удалось сформировать отчет';
    console.error('Report loading error:', err);
  } finally {
    loading.value = false;
  }
};

const buildReportParams = () => ({
  roomIds: selectedRoomIds.value,
  statusIds: selectedStatusIds.value,
  dateFrom: dateFrom.value,
  dateTo: dateTo.value,
});

const downloadPdf = async () => {
  if (availableStatuses.value.length > 0 && selectedStatusIds.value.length === 0) {
    error.value = 'Выберите хотя бы один статус брони';
    return;
  }

  pdfLoading.value = true;
  error.value = '';

  try {
    const res = await client.get('/reports/rooms/pdf', {
      params: buildReportParams(),
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rooms-report.pdf';
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    error.value = 'Не удалось скачать PDF';
    console.error('PDF download error:', err);
  } finally {
    pdfLoading.value = false;
  }
};

const ReportTable = defineComponent({
  props: {
    title: { type: String, required: true },
    emptyText: { type: String, required: true },
    rows: { type: Array as () => ReportGroup[], required: true },
  },
  setup(props) {
    return () =>
      h('div', { class: 'card shadow-sm h-100' }, [
        h(
          'div',
          {
            class: 'card-header fw-semibold',
            style: 'background-color: #4c4993; color: #fff',
          },
          props.title,
        ),
        h('div', { class: 'card-body p-0' }, [
          h('div', { class: 'table-responsive' }, [
            h('table', { class: 'table table-hover mb-0' }, [
              h('thead', [
                h('tr', [
                  h('th', { class: 'ps-3' }, 'Период'),
                  h('th', 'Броней'),
                  h('th', 'Ночей'),
                  h('th', 'ADR'),
                  h('th', { class: 'text-end pe-3' }, 'Выручка'),
                ]),
              ]),
              h(
                'tbody',
                props.rows.length
                  ? props.rows.map((row) =>
                      h('tr', { key: row.key }, [
                        h('td', { class: 'ps-3' }, row.label),
                        h('td', row.reservationsCount),
                        h('td', row.nights),
                        h('td', formatMoney(row.averageDailyRate)),
                        h('td', { class: 'text-end pe-3' }, formatMoney(row.revenue)),
                      ]),
                    )
                  : [
                      h('tr', [
                        h(
                          'td',
                          { colspan: 5, class: 'text-center py-4 text-muted' },
                          props.emptyText,
                        ),
                      ]),
                    ],
              ),
            ]),
          ]),
        ]),
      ]);
  },
});

onMounted(async () => {
  try {
    await Promise.all([fetchRooms(), fetchReport()]);
  } catch (err) {
    error.value = 'Не удалось загрузить данные для отчетов';
    console.error('Reports page init error:', err);
  }
});
</script>

<style scoped>
.rooms-filter {
  max-height: 260px;
  overflow-y: auto;
}

.status-filter {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
}
</style>
