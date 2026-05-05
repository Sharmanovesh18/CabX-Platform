import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

const Payment = () => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Read booking from history state (pushed by Dashboard)
    const state = window.history.state;
    if (state && state.booking) {
      setBooking(state.booking);
    } else {
      // If no booking info, go back to dashboard
      navigate('/dashboard');
    }
  }, [navigate]);

  const startPayment = async () => {
    if (!booking) return;
    setLoading(true);
    setError(null);
    try {
      // Load Razorpay script
      await loadScript('https://checkout.razorpay.com/v1/checkout.js');

      // Create order on backend
      const amount = Math.round((booking.fare || 0) * 100);
      const res = await axios.post('http://localhost:5001/api/payments/create-order', {
        amount,
        bookingId: booking._id || null,
      }).catch(err => {
        console.error('Create order error response:', err?.response?.data || err.message);
        throw err;
      });

      const { order, key_id } = res.data || {};
      if (!order || !key_id) {
        console.error('Invalid order response', res.data);
        throw new Error(res.data?.message || 'Invalid order response from server');
      }

      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'SAARTHI',
        description: `Payment for ride ${booking.start} → ${booking.destination}`,
        order_id: order.id,
        handler: async function (response) {
          // Verify payment on server
          try {
            const verify = await axios.post('http://localhost:5001/api/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id || null,
            });
            if (verify.data && verify.data.success) {
              alert('Payment successful!');
              navigate('/dashboard');
            } else {
              setError('Payment verification failed.');
            }
          } catch (err) {
            console.error('Verify error', err);
            setError('Payment verification error.');
          }
        },
        prefill: {
          name: booking.user?.name || '',
          email: booking.user?.email || '',
          contact: booking.user?.phone || ''
        },
        notes: {
          bookingStart: booking.start,
          bookingDest: booking.destination
        },
        theme: { color: '#2563eb' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Payment init error:', err?.response?.data || err.message || err);
      const serverMsg = err?.response?.data?.message || err?.message;
      setError(serverMsg || 'Payment initialization failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Payment</h2>
      <div className="bg-white p-4 rounded shadow">
        <div><strong>From:</strong> {booking.start}</div>
        <div><strong>To:</strong> {booking.destination}</div>
        <div><strong>Fare:</strong> ₹{booking.fare}</div>
        <div className="mt-4">
          <button onClick={startPayment} disabled={loading} className="px-4 py-2 rounded bg-green-600 text-white">{loading ? 'Please wait...' : 'Pay with Razorpay'}</button>
        </div>
        {error && <div className="mt-4 text-red-600">{error}</div>}
      </div>
    </div>
  );
};

export default Payment;
