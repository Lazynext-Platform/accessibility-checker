// File: app/pages/plans/pro.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '~/utils/api';
import { Button, Heading, Text } from '@shadcn/ui';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const ProPlan = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trialStarted, setTrialStarted] = useState(false);
  const router = useRouter();

  const startTrial = async () => {
    setLoading(true);
    try {
      const response = await api.post('/checkout', {
        plan: 'pro',
        trial: true,
      });
      if (response.success) {
        setTrialStarted(true);
        router.push('/dashboard');
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 md:p-6 lg:p-8 mt-10 bg-white rounded-xl shadow-md">
      <Heading className="mb-4">Start your free trial</Heading>
      <Text className="mb-6">
        Get access to limited Pro features for a short period. No credit card required.
      </Text>
      {loading ? (
        <Button disabled>Loading...</Button>
      ) : trialStarted ? (
        <div className="flex items-center mb-4">
          <CheckCircleIcon className="w-6 h-6 text-green-500" />
          <Text className="ml-2">Trial started successfully!</Text>
        </div>
      ) : error ? (
        <div className="flex items-center mb-4">
          <XCircleIcon className="w-6 h-6 text-red-500" />
          <Text className="ml-2">{error}</Text>
        </div>
      ) : (
        <Button onClick={startTrial}>Start Free Trial</Button>
      )}
    </div>
  );
};

export default ProPlan;