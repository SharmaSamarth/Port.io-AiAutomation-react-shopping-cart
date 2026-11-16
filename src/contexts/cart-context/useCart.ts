import { useCartContext } from './CartContextProvider';
import useCartProducts from './useCartProducts';
import useCartTotal from './useCartTotal';

const useCart = () => {
  const { isOpen, setIsOpen } = useCartContext();
  const {
    products,
    addProduct,
    removeProduct,
    clearCart,
    increaseProductQuantity,
    decreaseProductQuantity,
  } = useCartProducts();
  const { total, updateCartTotal } = useCartTotal();

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  return {
    isOpen,
    openCart,
    closeCart,
    products,
    addProduct,
    removeProduct,
    clearCart,
    increaseProductQuantity,
    decreaseProductQuantity,
    total,
    updateCartTotal,
  };
};

export default useCart;
