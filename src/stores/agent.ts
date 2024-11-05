import { defineStore } from 'pinia';
import {
  getAgentPublicInfoAgentAgentIdGet,
  getAgentSecretAgentAgentIdSecretGet,
  getAgentSecretMessageAgentAgentIdSecretMessageGet,
} from 'src/apis/agents';
import { UIAgent } from 'src/types/agent';
import { useAccountStore } from 'stores/account';
import { useSubscriptionStore } from 'stores/subscription';

type AgentState = {
  agents: UIAgent[];
  isLoaded: boolean;
};

export const useAgentStore = defineStore('agents', {
  state: (): AgentState => ({
    agents: [],
    isLoaded: false,
  }),
  actions: {
    async load() {
      const { subscriptions } = useSubscriptionStore();
      const { account } = useAccountStore();

      if (account === null) {
        this.isLoaded = true;
        return;
      }

      const activeAgentSubscriptions = subscriptions.filter((sub) => sub.is_active && sub.type === 'agent');

      if (activeAgentSubscriptions.length === 0) {
        this.agents = [];
        this.isLoaded = true;
        return;
      }

      this.agents = (
        await Promise.all(
          activeAgentSubscriptions.map(async (agentSubscription) => {
            const agent = await getAgentPublicInfoAgentAgentIdGet({
              path: { agent_id: agentSubscription.id },
            });
            return agent.data;
          }),
        )
      ).filter((agent) => agent !== undefined);

      this.isLoaded = true;
    },

    async getAgentSecret(agentId: string) {
      const { signMessage } = useAccountStore();

      const messageResponse = await getAgentSecretMessageAgentAgentIdSecretMessageGet({ path: { agent_id: agentId } });

      if (messageResponse.data === undefined) {
        throw new Error(
          messageResponse.error.detail?.toString() ?? 'Unable to fetch the message to sign to get the agent secret',
        );
      }

      const signature = await signMessage(messageResponse.data.message);

      const secretResponse = await getAgentSecretAgentAgentIdSecretGet({
        path: { agent_id: agentId },
        query: {
          signature,
        },
      });

      if (secretResponse.data === undefined) {
        throw new Error(secretResponse.error.detail?.toString() ?? 'Unable to get the agent secret');
      }

      this.agents = this.agents.map((agent) => {
        if (agent.id === agentId) {
          return { ...agent, secret: secretResponse.data.secret };
        }
        return agent;
      });
    },
  },
});
