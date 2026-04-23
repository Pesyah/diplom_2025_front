import client from './client';

export interface Faculty {
  id: number;
  name: string;
  shortName?: string;
  // другие поля по факту ответа
}

export interface Department {
  id: number;
  name: string;
  facultyId?: number;
  // другие поля
}

export interface Group {
  id: number;
  name: string;
  groupCode?: string;
  departmentId?: number;
  // другие поля
}

export interface UserStructureInfo {
  id: string;
  email: string;
  name: string;
  surname: string;
  phone: string;
  roleType: {
    id: number;
    name: string;
  };
  created_at: string;
  group?: Group;
  department?: Department;
  faculty?: Faculty;
}

export const structureApi = {
  // Факультеты
  getFaculties: (query?: string) =>
    client.get<Faculty[]>('/structure/faculties', { params: { query } }),

  getFacultyById: (id: number) =>
    client.get<Faculty>(`/structure/faculties/${id}`),

  // Кафедры
  getDepartments: (query?: string) =>
    client.get<Department[]>('/structure/departments', { params: { query } }),

  getDepartmentById: (id: number) =>
    client.get<Department>(`/structure/departments/${id}`),

  // Группы
  getGroups: (query?: string) =>
    client.get<Group[]>('/structure/groups', { params: { query } }),

  getGroupById: (id: number) => client.get<Group>(`/structure/groups/${id}`),

  // Пользователи
  getUsers: (query?: string) =>
    client.get<UserStructureInfo[]>('/structure/users', { params: { query } }),

  // Назначение структуры
  assignStructure(data: {
    userId: string;
    facultyId?: number;
    departmentId?: number;
    groupId?: number;
    isElder?: boolean;
  }) {
    return client.post('/structure/assign-structure', data);
  },
};
