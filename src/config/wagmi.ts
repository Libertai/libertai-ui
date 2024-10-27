import { createConfig, http } from '@wagmi/vue';
import { base, baseSepolia } from '@wagmi/vue/chains';
import { walletConnect } from '@wagmi/vue/connectors';
import env from 'src/config/env';

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    walletConnect({
      projectId: env.WALLET_CONNECT_PROJECT_ID,
      metadata: {
        name: 'LibertAI',
        description: 'Discover the Freedom of Decentralized AI',
        icons: ['https://chat.libertai.io/favicon.ico'],
        url: 'https://chat.libertai.io',
      },
    }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});
