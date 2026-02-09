// Create this component: CartInitializer.jsx
import { useEffect, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { initializeCartFromStorage } from '../redux/slices/cartSlice';
import { AuthContext } from '../context/AuthContext';

const CartInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { userEmail } = useContext(AuthContext);

  useEffect(() => {
    if (!userEmail) return;
    dispatch(initializeCartFromStorage({ email: userEmail || "guest@gmail.com" }));
  }, [dispatch, userEmail]);

  return children;
};

export default CartInitializer;
