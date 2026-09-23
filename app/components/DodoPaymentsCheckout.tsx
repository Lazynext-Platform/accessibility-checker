// File: app/components/DodoPaymentsCheckout.tsx
import { useState } from 'react';
import { TailwindCssClasses } from '../types/tailwind';

interface DodoPaymentsCheckoutProps {
  data: any;
  onSubmit: (data: any) => void;
}

const DodoPaymentsCheckout = ({ data, onSubmit }: DodoPaymentsCheckoutProps) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [amount, setAmount] = useState(data.amount);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const checkoutData = {
      cardNumber,
      expirationDate,
      cvv,
      amount,
    };
    onSubmit(checkoutData);
  };

  return (
    <form onSubmit={handleSubmit} className={TailwindCssClasses.form}>
      <label className={TailwindCssClasses.label}>
        Card Number:
        <input
          type="text"
          value={cardNumber}
          onChange={(event) => setCardNumber(event.target.value)}
          className={TailwindCssClasses.input}
        />
      </label>
      <label className={TailwindCssClasses.label}>
        Expiration Date:
        <input
          type="text"
          value={expirationDate}
          onChange={(event) => setExpirationDate(event.target.value)}
          className={TailwindCssClasses.input}
        />
      </label>
      <label className={TailwindCssClasses.label}>
        CVV:
        <input
          type="text"
          value={cvv}
          onChange={(event) => setCvv(event.target.value)}
          className={TailwindCssClasses.input}
        />
      </label>
      <label className={TailwindCssClasses.label}>
        Amount:
        <input
          type="number"
          value={amount}
          onChange={(event) => setAmount(event.target.valueAsNumber)}
          className={TailwindCssClasses.input}
        />
      </label>
      <button type="submit" className={TailwindCssClasses.button}>
        Pay Now
      </button>
    </form>
  );
};

export default DodoPaymentsCheckout;