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

export interface CartCoffeePriceSource {
  id: string;
  name: string;
  coffeeVolumeRelation?: {
    id: number;
    price: string | number;
    coffeeVolume?: {
      name?: string;
    };
    coffeeAdditiveRelation?: {
      id: number;
      price: string | number;
      coffeeAdditive?: {
        name?: string;
      };
    }[];
  }[];
}

export interface CartProductPriceSource {
  id: string;
  name: string;
  price: string | number;
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);

  const parsePrice = (price: string | number) => {
    const value = Number(price);
    return Number.isFinite(value) ? value : null;
  };

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

  const refreshPrices = (
    coffeeList: CartCoffeePriceSource[],
    productList: CartProductPriceSource[],
  ) => {
    let hasChanges = false;

    items.value.forEach((item) => {
      if (item.type === 'product') {
        const product = productList.find((p) => p.id === item.productId);
        if (!product) return;

        const nextPrice = parsePrice(product.price);
        if (nextPrice === null) return;

        if (item.productName !== product.name || item.price !== nextPrice) {
          item.productName = product.name;
          item.price = nextPrice;
          hasChanges = true;
        }

        return;
      }

      const coffee = coffeeList.find((c) => c.id === item.coffeeId);
      const volumeRelation = coffee?.coffeeVolumeRelation?.find(
        (vr) => vr.id === item.coffeeVolumeRelationId,
      );

      if (!coffee || !volumeRelation) return;

      const nextVolumePrice = parsePrice(volumeRelation.price);
      if (nextVolumePrice === null) return;

      const nextVolumeName =
        volumeRelation.coffeeVolume?.name || item.volumeName;

      if (
        item.coffeeName !== coffee.name ||
        item.volumeName !== nextVolumeName ||
        item.coffeeVolumeRelationPrice !== nextVolumePrice
      ) {
        item.coffeeName = coffee.name;
        item.volumeName = nextVolumeName;
        item.coffeeVolumeRelationPrice = nextVolumePrice;
        hasChanges = true;
      }

      item.additives.forEach((additive) => {
        const additiveRelation =
          volumeRelation.coffeeAdditiveRelation?.find(
            (ar) => ar.id === additive.coffeeAdditiveRelationId,
          );
        if (!additiveRelation) return;

        const nextAdditivePrice = parsePrice(additiveRelation.price);
        if (nextAdditivePrice === null) return;

        const nextAdditiveName =
          additiveRelation.coffeeAdditive?.name || additive.additiveName;

        if (
          additive.additiveName !== nextAdditiveName ||
          additive.coffeeAdditiveRelationPrice !== nextAdditivePrice
        ) {
          additive.additiveName = nextAdditiveName;
          additive.coffeeAdditiveRelationPrice = nextAdditivePrice;
          hasChanges = true;
        }
      });
    });

    if (hasChanges) {
      saveToStorage();
    }
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
    refreshPrices,
    totalPrice,
    itemsCount,
    getFormattedItemName,
    getItemPrice,
  };
});
