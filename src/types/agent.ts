import { GetAgentResponse } from 'src/apis/agents';

export type UIAgent = GetAgentResponse & { secret?: string };
