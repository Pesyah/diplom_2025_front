import { config } from '@/config';

// src/composables/useImageUrl.ts
export const useImageUrl = () => {
  const getImageUrl = (path?: string | null) => {
    if (!path) return '';

    // Если это уже полный URL - возвращаем как есть
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // Нормализуем путь (меняем обратные слеши на прямые)
    const apiUrl = config.apiUrl.replace(/\/+$/, '');
    let normalizedPath = path.trim().replace(/\\/g, '/');

    // Убираем начальный слеш если есть
    if (normalizedPath.startsWith('/')) {
      normalizedPath = normalizedPath.substring(1);
    }

    return `${apiUrl}/${normalizedPath}`;
  };

  return { getImageUrl };
};
