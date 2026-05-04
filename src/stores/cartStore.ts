// src/stores/cartStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  count: number;
  photo?: string;
  brand?: string;
  category?: string;
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);

  const loadFromStorage = () => {
    const saved = localStorage.getItem('techCart');
    if (saved) items.value = JSON.parse(saved);
  };

  const saveToStorage = () => {
    localStorage.setItem('techCart', JSON.stringify(items.value));
  };

  const addItem = (item: CartItem) => {
    const existing = items.value.find((i) => i.productId === item.productId);
    if (existing) {
      existing.count += item.count;
    } else {
      items.value.push(item);
    }
    saveToStorage();
  };

  const removeItem = (productId: string) => {
    items.value = items.value.filter((i) => i.productId !== productId);
    saveToStorage();
  };

  const updateCount = (productId: string, count: number) => {
    const item = items.value.find((i) => i.productId === productId);
    if (item && count > 0) {
      item.count = count;
      saveToStorage();
    } else if (count <= 0) {
      removeItem(productId);
    }
  };

  const clearCart = () => {
    items.value = [];
    saveToStorage();
  };

  const totalPrice = () => {
    return items.value.reduce((sum, item) => sum + item.price * item.count, 0);
  };

  const itemsCount = () => {
    return items.value.reduce((sum, item) => sum + item.count, 0);
  };

  loadFromStorage();

  return {
    items,
    addItem,
    removeItem,
    updateCount,
    clearCart,
    totalPrice,
    itemsCount,
  };
});
