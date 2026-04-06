import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface CartItem {
  id: string;
  pizzaSizeRelationId: string;
  pizzaName: string;
  sizeName: string;
  price: number;
  count: number;
  photo?: string;
  additives: Array<{
    id: string;
    name: string;
    price: number;
    avatar?: string;
  }>;
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);

  const loadFromStorage = () => {
    const saved = localStorage.getItem('cart');
    if (saved) items.value = JSON.parse(saved);
  };

  const saveToStorage = () => {
    localStorage.setItem('cart', JSON.stringify(items.value));
  };

  const addItem = (item: CartItem) => {
    const existing = items.value.find((i) => i.id === item.id);
    if (existing) {
      existing.count += item.count;
    } else {
      items.value.push(item);
    }
    saveToStorage();
  };

  const removeItem = (id: string) => {
    items.value = items.value.filter((i) => i.id !== id);
    saveToStorage();
  };

  const updateCount = (id: string, count: number) => {
    const item = items.value.find((i) => i.id === id);
    if (item && count > 0) {
      item.count = count;
      saveToStorage();
    } else if (count <= 0) {
      removeItem(id);
    }
  };

  const clearCart = () => {
    items.value = [];
    saveToStorage();
  };

  const totalPrice = () => {
    return items.value.reduce((sum, item) => sum + item.price * item.count, 0);
  };

  loadFromStorage();

  return { items, addItem, removeItem, updateCount, clearCart, totalPrice };
});
