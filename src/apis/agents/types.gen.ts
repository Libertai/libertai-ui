// This file is auto-generated by @hey-api/openapi-ts

/**
 * An enumeration.
 */
export type AgentPythonPackageManager = 'poetry' | 'requirements' | 'pyproject';

/**
 * An enumeration.
 */
export type AgentUsageType = 'fastapi' | 'python';

export type Body_update_agent__agent_id__put = {
    secret: string;
    deploy_script_url?: string;
    python_version: string;
    usage_type: AgentUsageType;
    package_manager: AgentPythonPackageManager;
    code: (Blob | File);
};

export type DeleteAgentBody = {
    subscription_id: string;
    password: string;
};

export type GetAgentResponse = {
    id: string;
    subscription_id: string;
    instance_hash: string;
    last_update: number;
    instance_ip?: string;
};

export type GetAgentSecretMessage = {
    message: string;
};

export type GetAgentSecretResponse = {
    secret: string;
};

export type HTTPValidationError = {
    detail?: Array<ValidationError>;
};

export type SetupAgentBody = {
    subscription_id: string;
    password: string;
    account: SubscriptionAccount;
};

export type SubscriptionAccount = {
    address: string;
    chain: SubscriptionChain;
};

/**
 * An enumeration.
 */
export type SubscriptionChain = 'base' | 'solana';

export type UpdateAgentResponse = {
    instance_ip: string;
    error_log: string;
};

export type ValidationError = {
    loc: Array<(string | number)>;
    msg: string;
    type: string;
};

export type SetupAgentPostData = {
    body: SetupAgentBody;
};

export type SetupAgentPostResponse = (unknown);

export type SetupAgentPostError = (HTTPValidationError);

export type DeleteAgentDeleteData = {
    body: DeleteAgentBody;
};

export type DeleteAgentDeleteResponse = (unknown);

export type DeleteAgentDeleteError = (HTTPValidationError);

export type GetAgentPublicInfoAgentAgentIdGetData = {
    path: {
        agent_id: string;
    };
};

export type GetAgentPublicInfoAgentAgentIdGetResponse = (GetAgentResponse);

export type GetAgentPublicInfoAgentAgentIdGetError = (HTTPValidationError);

export type UpdateAgentAgentIdPutData = {
    body: Body_update_agent__agent_id__put;
    path: {
        agent_id: string;
    };
};

export type UpdateAgentAgentIdPutResponse = (UpdateAgentResponse);

export type UpdateAgentAgentIdPutError = (HTTPValidationError);

export type GetAgentSecretAgentAgentIdSecretGetData = {
    path: {
        agent_id: string;
    };
    query: {
        signature: string;
    };
};

export type GetAgentSecretAgentAgentIdSecretGetResponse = (GetAgentSecretResponse);

export type GetAgentSecretAgentAgentIdSecretGetError = (HTTPValidationError);

export type GetAgentSecretMessageAgentAgentIdSecretMessageGetData = {
    path: {
        agent_id: string;
    };
};

export type GetAgentSecretMessageAgentAgentIdSecretMessageGetResponse = (GetAgentSecretMessage);

export type GetAgentSecretMessageAgentAgentIdSecretMessageGetError = (HTTPValidationError);