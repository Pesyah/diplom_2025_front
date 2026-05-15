import { config } from '@/config';

export const useImageUrl = () => {
  const getImageUrl = (path?: string | null) => {
    if (!path) return '';

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    const apiUrl = config.apiUrl.replace(/\/+$/, '');
    let normalizedPath = path.trim().replace(/\\/g, '/');

    if (normalizedPath.startsWith('/')) {
      normalizedPath = normalizedPath.substring(1);
    }

    return `${apiUrl}/${normalizedPath}`;
  };

  return { getImageUrl };
};
