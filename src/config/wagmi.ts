import { createConfig, http } from '@wagmi/vue';
import { mainnet, sepolia } from '@wagmi/vue/chains';
import { injected } from '@wagmi/connectors';

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
