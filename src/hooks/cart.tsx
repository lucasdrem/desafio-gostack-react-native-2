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
      // await AsyncStorage.removeItem('@GoMarketplace:cart');
      const products = await AsyncStorage.getItem('@GoMarketplace:cart');
      if (products) {
        setProducts([...JSON.parse(products)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      let productsAddedTocart: Product[];
      const alreadyExistsProduct = products.findIndex(
        productSearch => productSearch.id === product.id,
      );

      if (alreadyExistsProduct === -1) {
        productsAddedTocart = [...products, { ...product, quantity: 1 }];
      } else {
        productsAddedTocart = products.map(productSearch =>
          productSearch.id === product.id
            ? { ...product, quantity: productSearch.quantity + 1 }
            : productSearch,
        );
      }

      setProducts(productsAddedTocart);
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(productsAddedTocart),
      );
    },
    [products],
  );

  const increment = useCallback(async id => {
    const productsIncrement = products.map(productSearch =>
      productSearch.id === id
        ? { ...productSearch, quantity: productSearch.quantity + 1 }
        : productSearch,
    );

    setProducts([...productsIncrement]);
    await AsyncStorage.setItem(
      '@GoMarketplace:cart',
      JSON.stringify(productsIncrement),
    );
  }, [products]);

  const decrement = useCallback(async id => {
    const productsDecrement = products.map(productSearch => {
      if(productSearch.id === id ){
        return { ...productSearch, quantity: productSearch.quantity > 1 ? productSearch.quantity - 1 : 1 };
      }
      return {...productSearch };
    });

    setProducts([...productsDecrement]);
    await AsyncStorage.setItem(
      '@GoMarketplace:cart',
      JSON.stringify(productsDecrement),
    );
  }, [products]);

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
