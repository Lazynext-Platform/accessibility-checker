// File: app/pages/checkout/dodo-payments.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '../utils/api';
import { DodoPaymentsCheckout } from '../components/DodoPaymentsCheckout';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';
import { useSession } from '../contexts/session';
import { TailwindCssClasses } from '../types/tailwind';

const DodoPaymentsCheckoutPage = () => {
  const router = useRouter();
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);

  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/checkout');
        setCheckoutData(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCheckoutData();
  }, []);

  const handleCheckout = async (data: any) => {
    try {
      setLoading(true);
      const response = await api.post('/checkout', data);
      router.push(response.data.redirectUrl);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error.message} />;
  }

  return (
    <div className={TailwindCssClasses.container}>
      <h1 className={TailwindCssClasses.heading}>Dodo Payments Checkout</h1>
      {checkoutData && (
        <DodoPaymentsCheckout
          data={checkoutData}
          onSubmit={handleCheckout}
        />
      )}
    </div>
  );
};

export default DodoPaymentsCheckoutPage;