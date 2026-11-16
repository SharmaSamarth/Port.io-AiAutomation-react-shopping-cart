import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithThemeProvider } from 'utils/test/test-utils';
import { darkTheme } from 'commons/style/theme';
import { CartProvider, useCart } from 'contexts/cart-context';
import { mockCartProducts } from 'utils/test/mocks';

import Cart from '.';

describe('[components] - Cart', () => {
  const setup = () => {
    return renderWithThemeProvider(
      <CartProvider>
        <Cart />
      </CartProvider>
    );
  };

  test('should render correctly', () => {
    const view = setup();
    expect(view).toMatchSnapshot();
  });

  test('should render correctly in dark mode', () => {
    const view = renderWithThemeProvider(
      <CartProvider>
        <Cart />
      </CartProvider>,
      darkTheme
    );
    expect(view).toMatchSnapshot();
  });

  describe('clear cart', () => {
    /* Test-only controls to put products in the cart and open it */
    const Seed = () => {
      const { addProduct, openCart } = useCart();

      return (
        <>
          <button onClick={() => addProduct(mockCartProducts[0])}>
            seed first
          </button>
          <button onClick={() => addProduct(mockCartProducts[1])}>
            seed second
          </button>
          <button onClick={openCart}>seed open</button>
        </>
      );
    };

    const setupWithSeed = () =>
      renderWithThemeProvider(
        <CartProvider>
          <Seed />
          <Cart />
        </CartProvider>
      );

    const clearButton = () =>
      screen.queryByRole('button', { name: 'Clear cart' });
    const emptyMessage = () =>
      screen.queryByText(/Add some products in the cart/);

    test('should not offer the button when the cart is empty', () => {
      setupWithSeed();
      fireEvent.click(screen.getByText('seed open'));

      expect(emptyMessage()).toBeInTheDocument();
      expect(clearButton()).not.toBeInTheDocument();
    });

    test('should remove every product and reset the total in one action', () => {
      setupWithSeed();
      fireEvent.click(screen.getByText('seed first'));
      fireEvent.click(screen.getByText('seed second'));
      fireEvent.click(screen.getByText('seed open'));

      expect(emptyMessage()).not.toBeInTheDocument();
      expect(screen.getByText('$ 24.15')).toBeInTheDocument();
      expect(clearButton()).toBeEnabled();

      fireEvent.click(clearButton() as HTMLElement);

      expect(emptyMessage()).toBeInTheDocument();
      expect(screen.getByText('$ 0.00')).toBeInTheDocument();
      expect(screen.queryByText(/OR UP TO/)).not.toBeInTheDocument();
      expect(clearButton()).not.toBeInTheDocument();
    });

    test('should show a zero item count after clearing', () => {
      setupWithSeed();
      fireEvent.click(screen.getByText('seed first'));
      fireEvent.click(screen.getByText('seed first'));

      expect(screen.getByTitle('Products in cart quantity')).toHaveTextContent(
        '2'
      );

      fireEvent.click(screen.getByText('seed open'));
      fireEvent.click(clearButton() as HTMLElement);
      /* Close the cart: the toggle shows the item count again */
      fireEvent.click(screen.getByText('X'));

      expect(screen.getByTitle('Products in cart quantity')).toHaveTextContent(
        '0'
      );
    });

    test('should hide the button when the last product is removed', () => {
      setupWithSeed();
      fireEvent.click(screen.getByText('seed first'));
      fireEvent.click(screen.getByText('seed second'));
      fireEvent.click(screen.getByText('seed open'));

      fireEvent.click(screen.getAllByTitle('remove product from cart')[0]);
      expect(clearButton()).toBeInTheDocument();

      fireEvent.click(screen.getAllByTitle('remove product from cart')[0]);
      expect(clearButton()).not.toBeInTheDocument();
    });

    test('should clear from the keyboard and keep focus in the cart', () => {
      setupWithSeed();
      fireEvent.click(screen.getByText('seed first'));
      fireEvent.click(screen.getByText('seed open'));

      (clearButton() as HTMLElement).focus();
      userEvent.keyboard('{enter}');

      expect(emptyMessage()).toBeInTheDocument();
      expect(screen.getByText('X').closest('button')).toHaveFocus();
    });
  });
});
