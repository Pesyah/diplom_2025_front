export type RoleName = 'user' | 'admin' | string;

export interface UserRoleType {
  id: number;
  name: RoleName;
}

export interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
  phone: string;
  roleType?: UserRoleType;
  created_at?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
  surname: string;
  phone: string;
}

export interface UpdateUserPayload {
  name?: string;
  surname?: string;
  phone?: string;
}

export interface Author {
  id: string;
  name: string;
  surname: string;
  patronymic?: string | null;
  dateOfBirth: string;
  dateOfDeath?: string | null;
  booksCount?: number;
}

export interface Genre {
  id: number;
  name: string;
  countBooksWithGenre?: number;
}

export interface BookType {
  id: number;
  name: string;
}

export interface BookPriceHistory {
  id: number;
  price: number | string;
  created_at: string;
}

export interface Book {
  id: string;
  name: string;
  authors?: Author[];
  genres?: Genre[];
  booksType?: BookType;
  canBeRented: boolean;
  onlyForRent: boolean;
  price: number | string;
  description: string;
  avatar?: string | null;
  photoGallery?: string[];
  isActive: boolean;
  listingCode?: string;
  isbn?: string | null;
  priceHistory?: BookPriceHistory[];
  booksPriceHistory?: BookPriceHistory[];
}

export interface CreateBookPayload {
  name: string;
  authorsIds: string[];
  genresIds: number[];
  booksTypeId: number;
  canBeRented?: boolean;
  onlyForRent?: boolean;
  price: number;
  description: string;
  avatar?: string;
  photoGallery?: string[];
  isbn?: string;
}

export interface UpdateBookPayload extends Partial<CreateBookPayload> {
  id: string;
  isActive?: boolean;
}

export interface ActivateBookPayload {
  bookId: string;
  isbn: string;
}

export interface CreateAuthorPayload {
  name: string;
  surname: string;
  patronymic?: string;
  dateOfBirth: string;
  dateOfDeath?: string;
}

export interface UpdateAuthorPayload extends Partial<CreateAuthorPayload> {
  id: string;
}

export interface Rent {
  id: string;
  books: Book;
  buyer: User;
  seller: User;
  rentStart: string;
  rentEnd: string;
  isAccepted: boolean;
  penaltyPrice?: number | string | null;
}

export interface CreateRentPayload {
  bookId: string;
  rentStart: string;
  rentEnd: string;
}

export interface UpdateRentPayload {
  bookId?: string;
  rentStart?: string;
  rentEnd?: string;
  isAccepted?: boolean;
  penaltyPrice?: number;
}

export interface Sale {
  id: string;
  books: Book;
  buyer: User;
  seller: User;
  price: number | string;
  isAccepted: boolean;
  created_at: string;
}

export interface CreateSalePayload {
  bookId: string;
}

export interface UploadedDocument {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  createdAt: string;
  url?: string;
}

export interface AccessTokenResponse {
  access_token: string;
}

export interface ApiMessage {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}
