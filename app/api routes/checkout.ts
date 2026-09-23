// File: app/api routes/checkout.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { platform } from '~/utils/platform';

const checkoutSchema = z.object({
  plan: z.string(),
  trial: z.boolean(),
});

const checkoutHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { plan, trial } = checkoutSchema.parse(req.body);

  try {
    const response = await platform.post('/api/v1/billing/checkout', {
      plan,
      trial,
    });
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export default checkoutHandler;