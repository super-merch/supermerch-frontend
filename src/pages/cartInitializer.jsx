// Create this component: CartInitializer.jsx
import { useEffect, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { initializeCartFromStorage } from '../redux/slices/cartSlice';
import { AppContext } from '../context/AppContext';
import axios from 'axios';

const CartInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const backednUrl = import.meta.env.VITE_BACKEND_URL; // Adjust based on your environment variable setup

  useEffect(() => {
    const initializeCart = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const { data } = await axios.get(`${backednUrl}/api/auth/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (data.success) {
          // Initialize cart from storage for this user
          dispatch(initializeCartFromStorage({ email: data.email }));
        }
      } catch (error) {
        console.error("Error initializing cart:", error);
      }
    };

    initializeCart();
  }, [dispatch, backednUrl]);

  return children;
};

export default CartInitializer;