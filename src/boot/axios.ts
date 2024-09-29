import { boot } from 'quasar/wrappers';
import { client } from 'src/apis/subscriptions/services.gen';

export default boot(() => {
  client.setConfig({
    baseURL: process.env.LTAI_SUBSCRIPTIONS_API_URL,
  });
});
