import { createConfig, http } from '@wagmi/vue';
import { base, baseSepolia } from '@wagmi/vue/chains';
import { injected } from '@wagmi/connectors';

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [injected()],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});
