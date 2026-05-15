import type { BookType, Genre } from '@/types/library';

export const BOOK_TYPES: BookType[] = [
  { id: 1, name: 'Электронная' },
  { id: 2, name: 'Бумажная' },
  { id: 3, name: 'Аудио' },
];

export const GENRES: Genre[] = [
  { id: 1, name: 'Классика' },
  { id: 2, name: 'Современная проза' },
  { id: 3, name: 'Фантастика' },
  { id: 4, name: 'Фэнтези' },
  { id: 5, name: 'Детективы' },
  { id: 6, name: 'Триллеры' },
  { id: 7, name: 'Романтика' },
  { id: 8, name: 'Приключения' },
  { id: 9, name: 'Ужасы' },
  { id: 10, name: 'История' },
  { id: 11, name: 'Биографии и мемуары' },
  { id: 12, name: 'Наука и образование' },
  { id: 13, name: 'Бизнес и экономика' },
  { id: 14, name: 'Психология' },
  { id: 15, name: 'Саморазвитие' },
  { id: 16, name: 'Философия' },
  { id: 17, name: 'Детская литература' },
  { id: 18, name: 'Подростковая литература' },
  { id: 19, name: 'Поэзия' },
  { id: 20, name: 'Драма' },
  { id: 21, name: 'Комиксы и графические романы' },
  { id: 22, name: 'Компьютеры и IT' },
  { id: 23, name: 'Искусство и культура' },
  { id: 24, name: 'Здоровье' },
];

export const DEFAULT_BOOK_FORM = {
  name: '',
  authorsIds: [] as string[],
  genresIds: [] as number[],
  booksTypeId: 2,
  canBeRented: true,
  onlyForRent: false,
  price: 0,
  description: '',
  avatar: '',
  photoGallery: [] as string[],
  isbn: '',
};
