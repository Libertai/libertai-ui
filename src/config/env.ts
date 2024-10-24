import { z } from 'zod';
import { base, baseSepolia } from '@wagmi/vue/chains';

const envSchema = z.object({
  ALEPH_API_URL: z.string().optional(),
  LTAI_SUBSCRIPTIONS_API_URL: z.string(),
  WALLET_CONNECT_PROJECT_ID: z.string(),
  LTAI_BASE_ADDRESS: z.string().startsWith('0x').optional().default('0xF8B1b47AA748F5C7b5D0e80C726a843913EB573a'),
  LTAI_PUBLISHER_ADDRESS: z.string().startsWith('0x').optional().default('0xCBFc3EeC41CBBfCAcc50337d712890C47a14ba99'),
  WAGMI_BASE_ID: z.union([z.literal(base.id), z.literal(baseSepolia.id)]).default(base.id),
});

const env = envSchema.parse(process.env);

export default env;