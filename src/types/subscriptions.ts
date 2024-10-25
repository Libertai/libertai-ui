import { SubscriptionType } from 'src/apis/subscriptions';

export type FullUserSubscriptionType = Exclude<SubscriptionType, 'agent'> | 'free' | 'enterprise';

export type SubscriptionPlan = {
  type: FullUserSubscriptionType;
  name: string;
  description: string;
  monthly_use_price?: number;
  hold_price?: number;
  features: string[];
};

export type UISubscriptionPlan = SubscriptionPlan & {
  button: {
    text: string;
    disabled: boolean;
  };
};

export const subscriptionPlans: Record<FullUserSubscriptionType, SubscriptionPlan> = {
  free: {
    type: 'free',
    name: 'Basic',
    description: "Perfect to explore LibertAI's capabilities without committing to a paid subscription.",
    monthly_use_price: 0,
    features: ['25 text prompts per day', 'Change AI Personas', '1 Knowledge Base (Max 10MB)', 'Basic AI Models'],
  },
  pro: {
    type: 'pro',
    name: 'Superior',
    description: 'Ideal for individuals who require Professional AI capabilities and additional features.',
    monthly_use_price: 7,
    hold_price: 500,
    features: [
      '100 text prompts per day',
      'Change AI Personas',
      '3 Knowledge Base (Max 30MB)',
      'Pro AI Models',
      'Limited API key usage',
    ],
  },
  advanced: {
    type: 'advanced',
    name: 'Ultimate',
    description: 'Premium tier that offers the most comprehensive set of features and benefits.',
    monthly_use_price: 21,
    hold_price: 1500,
    features: [
      '500 text prompts per day',
      'Change AI Personas',
      '10 Knowledge Base (Max 300MB)',
      'All AI Models',
      'Advanced API key usage',
      'Free trials and benefits for new features',
    ],
  },
  enterprise: {
    type: 'enterprise',
    name: 'Enterprise',
    description: 'A customized subscription tier designed to meet the unique needs of your organization.',
    features: [
      'Unlimited prompts',
      'Unlimited Knowledge Bases',
      'Unlimited API keys',
      'Dedicated support (Telegram group)',
    ],
  },
};
