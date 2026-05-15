import type { Author, Book, User } from '@/types/library';

export const formatMoney = (value?: number | string | null) => {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
};

export const formatDate = (value?: string | Date | null) => {
  if (!value) return 'не указано';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'не указано';
  return new Intl.DateTimeFormat('ru-RU').format(date);
};

export const formatAuthorName = (author: Author) =>
  [author.surname, author.name, author.patronymic].filter(Boolean).join(' ');

export const formatUserName = (user?: User | null) =>
  user ? `${user.name} ${user.surname}`.trim() || user.email : 'Неизвестно';

export const bookAuthors = (book: Book) =>
  book.authors?.map(formatAuthorName).join(', ') || 'Автор не указан';

export const bookGenres = (book: Book) =>
  book.genres?.map((genre) => genre.name).join(', ') || 'Без жанра';

export const bookListingCode = (book: Book) =>
  book.listingCode || 'Код еще не присвоен';

export const bookAvailability = (book: Book) => {
  if (!book.isActive) return 'Черновик';
  if (book.onlyForRent) return 'Только аренда';
  if (book.canBeRented) return 'Продажа и аренда';
  return 'Продажа';
};
