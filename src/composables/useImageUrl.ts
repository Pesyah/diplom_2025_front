import { config } from '@/config';

export const useImageUrl = () => {
  const getImageUrl = (path: string) => {
    if (!path) return '';
    return `${config.apiUrl}/${path.replace(/\\/g, '/')}`;
  };

  return { getImageUrl };
};
