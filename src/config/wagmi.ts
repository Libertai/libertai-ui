import { injected } from '@wagmi/connectors';
import { createConfig, http } from '@wagmi/vue';
import { base, baseSepolia } from '@wagmi/vue/chains';

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [injected()],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});
