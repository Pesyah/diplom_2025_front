import type { ApiMessage } from '@/types/library';
import { useFeedbackStore } from '@/stores/feedbackStore';
import axios from 'axios';

const unreadablePattern = /[РС][\u00a0-\u00ff]|вЂ|�/;

const normalizeMessage = (message?: string | string[]) => {
  if (Array.isArray(message)) {
    return message.join(', ');
  }

  return message;
};

const getReadableMessage = (
  message: string | undefined,
  fallback: string,
) => {
  if (!message || unreadablePattern.test(message)) {
    return fallback;
  }

  return message;
};

export const showSuccessMessage = (message: string, title = 'Готово') => {
  useFeedbackStore().showSuccess(message, title);
};

export const showErrorMessage = (message: string, title = 'Ошибка') => {
  useFeedbackStore().showError(message, title);
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Произошла ошибка',
) => {
  let result = fallback;

  if (!axios.isAxiosError<ApiMessage>(error)) {
    showErrorMessage(result);
    return result;
  }

  const message =
    normalizeMessage(error.response?.data?.message) || error.response?.data?.error;
  result = getReadableMessage(message, fallback);

  showErrorMessage(result);
  return result;
};
