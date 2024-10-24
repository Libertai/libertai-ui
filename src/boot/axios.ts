import { boot } from 'quasar/wrappers';
import { client } from 'src/apis/subscriptions/services.gen';
import env from 'src/config/env';

export default boot(() => {
  client.setConfig({
    baseURL: env.LTAI_SUBSCRIPTIONS_API_URL,
  });
});
