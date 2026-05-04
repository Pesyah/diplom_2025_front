import { config } from '@/config';

// src/composables/useImageUrl.ts
export const useImageUrl = () => {
  const getImageUrl = (path: string) => {
    if (!path) return '';

    // Если это уже полный URL - возвращаем как есть
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // Нормализуем путь (меняем обратные слеши на прямые)
    let normalizedPath = path.replace(/\\/g, '/');

    // Убираем начальный слеш если есть
    if (normalizedPath.startsWith('/')) {
      normalizedPath = normalizedPath.substring(1);
    }

    return `${config.apiUrl}/${normalizedPath}`;
  };

  return { getImageUrl };
};
