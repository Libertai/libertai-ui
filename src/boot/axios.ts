import { boot } from 'quasar/wrappers';
import { client as agentsClient } from 'src/apis/agents/services.gen';
import { client as subscriptionsClient } from 'src/apis/subscriptions/services.gen';
import env from 'src/config/env';

export default boot(() => {
  subscriptionsClient.setConfig({
    baseURL: env.LTAI_SUBSCRIPTIONS_API_URL,
  });
  agentsClient.setConfig({
    baseURL: env.LTAI_AGENTS_API_URL,
  });
});
