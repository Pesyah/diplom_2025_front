<template>
  <div class="book-cover" :class="{ 'book-cover-empty': !imageUrl }">
    <img v-if="imageUrl" :src="imageUrl" :alt="title" loading="lazy" />
    <div v-else class="book-cover-fallback">
      <span>{{ initials }}</span>
      <small>{{ title }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useImageUrl } from '@/composables/useImageUrl';
import { computed } from 'vue';

const props = defineProps<{
  path?: string | null;
  title: string;
}>();

const { getImageUrl } = useImageUrl();
const imageUrl = computed(() => getImageUrl(props.path));
const initials = computed(() =>
  props.title
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase(),
);
</script>
