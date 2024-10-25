import { SubscriptionType } from 'src/apis/subscriptions';

export type SubscriptionPlan = {
  type: SubscriptionType | 'free';
  name: string;
  description: string;
  monthly_use_price: number;
  hold_price?: number;
  button: {
    text: string;
    disabled: boolean;
  };
  features: string[];
};
