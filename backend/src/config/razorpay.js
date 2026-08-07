import Razorpay from 'razorpay';
import { env } from './env.js';

let razorpayInstance = null;

if (env.razorpay.keyId && env.razorpay.keySecret) {
  razorpayInstance = new Razorpay({
    key_id: env.razorpay.keyId,
    key_secret: env.razorpay.keySecret,
  });
}

export const razorpayConfig = {
  isConfigured: () => Boolean(env.razorpay.keyId && env.razorpay.keySecret),
};

export default razorpayInstance;
