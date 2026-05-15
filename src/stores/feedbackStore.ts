import { defineStore } from 'pinia';
import { ref } from 'vue';

type FeedbackType = 'success' | 'error' | 'info';

export const useFeedbackStore = defineStore('feedback', () => {
  const isOpen = ref(false);
  const type = ref<FeedbackType>('info');
  const title = ref('');
  const message = ref('');

  const show = (nextType: FeedbackType, nextTitle: string, nextMessage: string) => {
    type.value = nextType;
    title.value = nextTitle;
    message.value = nextMessage;
    isOpen.value = true;
  };

  const showError = (nextMessage: string, nextTitle = 'Ошибка') => {
    show('error', nextTitle, nextMessage);
  };

  const showSuccess = (nextMessage: string, nextTitle = 'Готово') => {
    show('success', nextTitle, nextMessage);
  };

  const showInfo = (nextMessage: string, nextTitle = 'Сообщение') => {
    show('info', nextTitle, nextMessage);
  };

  const close = () => {
    isOpen.value = false;
  };

  return {
    isOpen,
    type,
    title,
    message,
    show,
    showError,
    showSuccess,
    showInfo,
    close,
  };
});
