import { boot } from 'quasar/wrappers';
import { client as agentsClient } from 'src/apis/agents/services.gen';
import { client as subscriptionsClient } from 'src/apis/subscriptions/services.gen';
import { client as apiKeysClient } from 'src/apis/tokens/services.gen';
import env from 'src/config/env';

export default boot(() => {
  subscriptionsClient.setConfig({
    baseURL: env.LTAI_SUBSCRIPTIONS_API_URL,
  });
  agentsClient.setConfig({
    baseURL: env.LTAI_AGENTS_API_URL,
  });
  apiKeysClient.setConfig({
    baseURL: env.LTAI_AUTH_API_URL,
  });
});
