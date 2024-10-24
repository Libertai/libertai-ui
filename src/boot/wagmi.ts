import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { WagmiPlugin } from '@wagmi/vue';
import { boot } from 'quasar/wrappers';

import { config } from '../config/wagmi';

export default boot(({ app }) => {
  const queryClient = new QueryClient();

  app.use(WagmiPlugin, { config });
  app.use(VueQueryPlugin, { queryClient });
});
