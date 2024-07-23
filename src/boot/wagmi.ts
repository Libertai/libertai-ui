import { boot } from 'quasar/wrappers';
import { WagmiPlugin } from '@wagmi/vue';
import { config } from '../config/wagmi';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';

export default boot(({ app }) => {
  const queryClient = new QueryClient();

  app.use(WagmiPlugin, { config });
  app.use(VueQueryPlugin, { queryClient });
});
