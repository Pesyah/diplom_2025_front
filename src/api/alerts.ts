import client from './client';

export interface Document {
  id: string;
  url: string;
  originalName: string;
  size: number;
  mimetype?: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  documents: Document[];
  alertsTypeId: number;
  facultyId: number | null;
  departmentId: number | null;
  groupId: number | null;
  createdAt: string;
  updatedAt: string;
  // возможно, есть поля faculty, department, group с объектами
}

export interface GlobalAlert {
  id: string;
  title: string;
  description: string;
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAlertDto {
  title: string;
  description: string;
  documents?: string[]; // массив ID или путей
  alertsTypeId: number;
  facultyId?: number;
  departmentId?: number;
  groupId?: number;
}

export interface UpdateAlertDto {
  title?: string;
  description?: string;
  documents?: string[];
  alertsTypeId?: number;
  facultyId?: number | null;
  departmentId?: number | null;
  groupId?: number | null;
}

export interface CreateGlobalAlertDto {
  title: string;
  description: string;
  documents?: string[];
}

export interface UpdateGlobalAlertDto {
  title?: string;
  description?: string;
  documents?: string[];
}

export const alertsApi = {
  // Обычные уведомления
  getAlerts: (page = 1, limit = 10) =>
    client.get<{ data: Alert[]; total: number }>('/alerts', {
      params: { page, limit },
    }),

  getAlertById: (id: string) => client.get<Alert>(`/alerts/${id}`),

  createAlert: (data: CreateAlertDto) => client.post<Alert>('/alerts', data),

  updateAlert: (id: string, data: UpdateAlertDto) =>
    client.patch<Alert>(`/alerts/${id}`, data),

  deleteAlert: (id: string) => client.delete(`/alerts/${id}`),

  // Глобальные уведомления
  getGlobalAlerts: (page = 1, limit = 10) =>
    client.get<{ data: GlobalAlert[]; total: number }>('/alerts/global', {
      params: { page, limit },
    }),

  getGlobalAlertById: (id: string) =>
    client.get<GlobalAlert>(`/alerts/global/${id}`),

  createGlobalAlert: (data: CreateGlobalAlertDto) =>
    client.post<GlobalAlert>('/alerts/global', data),

  updateGlobalAlert: (id: string, data: UpdateGlobalAlertDto) =>
    client.patch<GlobalAlert>(`/alerts/global/${id}`, data),

  deleteGlobalAlert: (id: string) => client.delete(`/alerts/global/${id}`),
};
