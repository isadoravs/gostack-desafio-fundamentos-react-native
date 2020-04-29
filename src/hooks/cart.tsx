import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const prod = await AsyncStorage.getItem('@GoBarber:cartProducts');
      if (prod) setProducts(JSON.parse(prod));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productExists = products.findIndex(item => item.id === product.id);

      if (productExists > 0) {
        const newList = products;
        newList[productExists].quantity += 1;
        setProducts([...newList]);
      } else setProducts([...products, { ...product, quantity: 1 }]);

      await AsyncStorage.setItem(
        '@GoBarber:cartProducts',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProducts = products.map(prod => {
        if (prod.id === id) {
          // eslint-disable-next-line no-param-reassign
          prod.quantity += 1;
        }
        return prod;
      });

      setProducts([...newProducts]);
      await AsyncStorage.setItem(
        '@GoBarber:cartProducts',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProducts = products.filter(prod => {
        if (prod.id === id) {
          if (prod.quantity === 1) return false;
          if (prod.quantity > 0) {
            // eslint-disable-next-line no-param-reassign
            prod.quantity -= 1;
          }
        }
        return prod;
      });

      setProducts([...newProducts]);
      await AsyncStorage.setItem(
        '@GoBarber:cartProducts',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
