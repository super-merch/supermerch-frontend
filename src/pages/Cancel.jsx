// Cancel.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Cancel = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Clear any pending checkout data since payment was cancelled
    localStorage.removeItem('pendingCheckoutData');
    
    toast.error('Payment was cancelled. Please try again.');
    
    // Redirect back to checkout after showing the error
    const timer = setTimeout(() => {
      navigate('/checkout');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Cancelled</h2>
        <p className="text-gray-600 mb-4">Your payment was cancelled. Redirecting you back to checkout...</p>
        <button 
          onClick={() => navigate('/checkout')} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Return to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cancel;