// src/stores/cartStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface CartCoffeeAdditive {
  coffeeAdditiveRelationId: number;
  coffeeAdditiveRelationPrice: number;
  additiveName: string;
}

export interface CartCoffeeItem {
  type: 'coffee';
  coffeeId: string;
  coffeeName: string;
  coffeeVolumeRelationId: number;
  coffeeVolumeRelationPrice: number;
  volumeName: string;
  additives: CartCoffeeAdditive[];
  quantity: number;
}

export interface CartProductItem {
  type: 'product';
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export type CartItem = CartCoffeeItem | CartProductItem;

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);

  const loadFromStorage = () => {
    const saved = localStorage.getItem('coffeeCart');
    if (saved) items.value = JSON.parse(saved);
  };

  const saveToStorage = () => {
    localStorage.setItem('coffeeCart', JSON.stringify(items.value));
  };

  const isSameCoffeeItem = (a: CartCoffeeItem, b: CartCoffeeItem) => {
    if (a.coffeeVolumeRelationId !== b.coffeeVolumeRelationId) return false;
    const aIds = a.additives
      .map((ad) => ad.coffeeAdditiveRelationId)
      .sort()
      .join(',');
    const bIds = b.additives
      .map((ad) => ad.coffeeAdditiveRelationId)
      .sort()
      .join(',');
    return aIds === bIds;
  };

  const addItem = (item: CartItem) => {
    if (item.type === 'product') {
      const existing = items.value.find(
        (i) => i.type === 'product' && i.productId === item.productId,
      );
      if (existing && existing.type === 'product') {
        existing.quantity += item.quantity;
      } else {
        items.value.push(item);
      }
    } else if (item.type === 'coffee') {
      const existing = items.value.find(
        (i) => i.type === 'coffee' && isSameCoffeeItem(i, item),
      );
      if (existing && existing.type === 'coffee') {
        existing.quantity += item.quantity;
      } else {
        items.value.push(item);
      }
    }
    saveToStorage();
  };

  const removeItem = (index: number) => {
    items.value.splice(index, 1);
    saveToStorage();
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }
    items.value[index].quantity = quantity;
    saveToStorage();
  };

  const clearCart = () => {
    items.value = [];
    saveToStorage();
  };

  const totalPrice = () => {
    return items.value.reduce((sum, item) => {
      if (item.type === 'product') {
        return sum + item.price * item.quantity;
      } else {
        const additiveSum = item.additives.reduce(
          (s, a) => s + a.coffeeAdditiveRelationPrice,
          0,
        );
        return (
          sum + (item.coffeeVolumeRelationPrice + additiveSum) * item.quantity
        );
      }
    }, 0);
  };

  const itemsCount = () => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getFormattedItemName = (item: CartItem) => {
    if (item.type === 'product') {
      return item.productName;
    } else {
      let name = `${item.coffeeName} (${item.volumeName})`;
      if (item.additives.length > 0) {
        name += ' + ' + item.additives.map((a) => a.additiveName).join(', ');
      }
      return name;
    }
  };

  const getItemPrice = (item: CartItem) => {
    if (item.type === 'product') {
      return item.price;
    } else {
      const additiveSum = item.additives.reduce(
        (s, a) => s + a.coffeeAdditiveRelationPrice,
        0,
      );
      return item.coffeeVolumeRelationPrice + additiveSum;
    }
  };

  loadFromStorage();

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalPrice,
    itemsCount,
    getFormattedItemName,
    getItemPrice,
  };
});
