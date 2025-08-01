// Success.jsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      toast.success('Payment successful! Processing your order...');
      // Redirect back to checkout with success indicator and session ID
      navigate('/checkout', { 
        state: { 
          paymentSuccess: true, 
          sessionId: sessionId 
        },
        replace: true 
      });
    } else {
      toast.error('Invalid payment session');
      navigate('/checkout');
    }
  }, [navigate, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-lg">Processing your payment...</p>
      </div>
    </div>
  );
};

export default Success;