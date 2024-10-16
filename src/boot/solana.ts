import { boot } from 'quasar/wrappers';
import SolanaWallets from 'solana-wallets-vue';
import 'solana-wallets-vue/styles.css';

const walletOptions = {
  wallets: [],
  autoConnect: true,
};

export default boot(({ app }) => {
  app.use(SolanaWallets, walletOptions);
});
