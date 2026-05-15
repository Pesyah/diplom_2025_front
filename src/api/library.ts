import client from '@/api/client';
import type {
  AccessTokenResponse,
  ActivateBookPayload,
  Author,
  Book,
  CreateAuthorPayload,
  CreateBookPayload,
  CreateRentPayload,
  CreateSalePayload,
  LoginPayload,
  RegisterPayload,
  Rent,
  Sale,
  UpdateAuthorPayload,
  UpdateBookPayload,
  UpdateRentPayload,
  UpdateUserPayload,
  UploadedDocument,
  User,
} from '@/types/library';

export const authApi = {
  async register(payload: RegisterPayload) {
    const { data } = await client.post<AccessTokenResponse>(
      '/auth/register',
      payload,
    );
    return data;
  },

  async login(payload: LoginPayload) {
    const { data } = await client.post<AccessTokenResponse>(
      '/auth/login',
      payload,
    );
    return data;
  },

  async me() {
    const { data } = await client.get<User>('/auth/me');
    return data;
  },

  async updateUser(payload: UpdateUserPayload) {
    await client.patch('/auth/update-user', payload);
    return authApi.me();
  },

  async changePassword(oldPassword: string, newPassword: string) {
    const { data } = await client.post('/auth/change-password', {
      oldPassword,
      newPassword,
    });
    return data;
  },

  async resetPassword(email: string) {
    const { data } = await client.post('/auth/reset-password', { email });
    return data;
  },

  async createAdmin(payload: RegisterPayload) {
    const { data } = await client.post<User>('/auth/create-admin', payload);
    return data;
  },

  async usersByQuery(query: string) {
    const normalizedQuery = query.trim() || 'all';
    const { data } = await client.get<User[]>(
      `/auth/user-by-query/${encodeURIComponent(normalizedQuery)}`,
    );
    return data;
  },
};

export const booksApi = {
  async all() {
    const { data } = await client.get<Book[]>('/books/all');
    return data;
  },

  async byId(id: string) {
    const { data } = await client.get<Book>(
      `/books/by-id/${encodeURIComponent(id)}`,
    );
    return data;
  },

  async myBooks() {
    const { data } = await client.get<Book[]>('/books/by-user');
    return data;
  },

  async create(payload: CreateBookPayload) {
    const { data } = await client.post<Book>('/books', payload);
    return data;
  },

  async update(payload: UpdateBookPayload) {
    const { data } = await client.put<Book>('/books', payload);
    return data;
  },

  async activate(payload: ActivateBookPayload) {
    const { data } = await client.post<Book>('/books/activate', payload);
    return data;
  },

  async remove(id: string) {
    await client.delete(`/books/${encodeURIComponent(id)}`);
  },

  async authors() {
    const { data } = await client.get<Author[]>('/books/authors/all');
    return data;
  },

  async authorById(id: string) {
    const { data } = await client.get<Author>(
      `/books/authors/by-id/${encodeURIComponent(id)}`,
    );
    return data;
  },

  async createAuthor(payload: CreateAuthorPayload) {
    const { data } = await client.post<Author>('/books/authors', payload);
    return data;
  },

  async updateAuthor(payload: UpdateAuthorPayload) {
    const { data } = await client.put<Author>('/books/authors', payload);
    return data;
  },

  async removeAuthor(id: string) {
    await client.delete(`/books/authors/${encodeURIComponent(id)}`);
  },
};

export const rentApi = {
  async create(payload: CreateRentPayload) {
    const { data } = await client.post<Rent>('/rent', payload);
    return data;
  },

  async all() {
    const { data } = await client.get<Rent[]>('/rent');
    return data;
  },

  async incoming() {
    const { data } = await client.get<Rent[]>('/rent/incoming');
    return data;
  },

  async outgoing() {
    const { data } = await client.get<Rent[]>('/rent/outgoing');
    return data;
  },

  async byId(id: string) {
    const { data } = await client.get<Rent>(
      `/rent/by-id/${encodeURIComponent(id)}`,
    );
    return data;
  },

  async adminAll() {
    const { data } = await client.get<Rent[]>('/rent/admin/all');
    return data;
  },

  async adminById(id: string) {
    const { data } = await client.get<Rent>(
      `/rent/admin/by-id/${encodeURIComponent(id)}`,
    );
    return data;
  },

  async accept(id: string) {
    const { data } = await client.patch<Rent>(
      `/rent/${encodeURIComponent(id)}/accept`,
    );
    return data;
  },

  async update(id: string, payload: UpdateRentPayload) {
    const { data } = await client.patch<Rent>(
      `/rent/${encodeURIComponent(id)}`,
      payload,
    );
    return data;
  },

  async remove(id: string) {
    await client.delete(`/rent/${encodeURIComponent(id)}`);
  },
};

export const saleApi = {
  async create(payload: CreateSalePayload) {
    const { data } = await client.post<Sale>('/sale', payload);
    return data;
  },

  async all() {
    const { data } = await client.get<Sale[]>('/sale');
    return data;
  },

  async incoming() {
    const { data } = await client.get<Sale[]>('/sale/incoming');
    return data;
  },

  async outgoing() {
    const { data } = await client.get<Sale[]>('/sale/outgoing');
    return data;
  },

  async byId(id: string) {
    const { data } = await client.get<Sale>(
      `/sale/by-id/${encodeURIComponent(id)}`,
    );
    return data;
  },

  async adminAll() {
    const { data } = await client.get<Sale[]>('/sale/admin/all');
    return data;
  },

  async adminById(id: string) {
    const { data } = await client.get<Sale>(
      `/sale/admin/by-id/${encodeURIComponent(id)}`,
    );
    return data;
  },

  async accept(id: string) {
    const { data } = await client.patch<Sale>(
      `/sale/${encodeURIComponent(id)}/accept`,
    );
    return data;
  },
};

export const documentsApi = {
  async upload(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await client.post<UploadedDocument>(
      '/documents/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );

    return data;
  },
};
