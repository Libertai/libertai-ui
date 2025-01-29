// This file is auto-generated by @hey-api/openapi-ts

export const AgentPythonPackageManagerSchema = {
    type: 'string',
    enum: ['poetry', 'pip'],
    title: 'AgentPythonPackageManager',
    description: 'An enumeration.'
} as const;

export const Body_update_agent__agent_id__putSchema = {
    properties: {
        secret: {
            type: 'string',
            title: 'Secret'
        },
        deploy_script_url: {
            type: 'string',
            title: 'Deploy Script Url',
            default: 'https://raw.githubusercontent.com/Libertai/libertai-agents/refs/heads/reza/deployment-instances/deployment/deploy.sh'
        },
        python_version: {
            type: 'string',
            title: 'Python Version'
        },
        package_manager: {
            '$ref': '#/components/schemas/AgentPythonPackageManager'
        },
        code: {
            type: 'string',
            format: 'binary',
            title: 'Code'
        }
    },
    type: 'object',
    required: ['secret', 'python_version', 'package_manager', 'code'],
    title: 'Body_update_agent__agent_id__put'
} as const;

export const DeleteAgentBodySchema = {
    properties: {
        subscription_id: {
            type: 'string',
            title: 'Subscription Id'
        },
        password: {
            type: 'string',
            title: 'Password'
        }
    },
    type: 'object',
    required: ['subscription_id', 'password'],
    title: 'DeleteAgentBody'
} as const;

export const GetAgentResponseSchema = {
    properties: {
        id: {
            type: 'string',
            title: 'Id'
        },
        subscription_id: {
            type: 'string',
            title: 'Subscription Id'
        },
        instance_hash: {
            type: 'string',
            title: 'Instance Hash'
        },
        last_update: {
            type: 'integer',
            title: 'Last Update'
        },
        instance_ip: {
            type: 'string',
            title: 'Instance Ip'
        }
    },
    type: 'object',
    required: ['id', 'subscription_id', 'instance_hash', 'last_update'],
    title: 'GetAgentResponse'
} as const;

export const GetAgentSecretMessageSchema = {
    properties: {
        message: {
            type: 'string',
            title: 'Message'
        }
    },
    type: 'object',
    required: ['message'],
    title: 'GetAgentSecretMessage'
} as const;

export const GetAgentSecretResponseSchema = {
    properties: {
        secret: {
            type: 'string',
            title: 'Secret'
        }
    },
    type: 'object',
    required: ['secret'],
    title: 'GetAgentSecretResponse'
} as const;

export const HTTPValidationErrorSchema = {
    properties: {
        detail: {
            items: {
                '$ref': '#/components/schemas/ValidationError'
            },
            type: 'array',
            title: 'Detail'
        }
    },
    type: 'object',
    title: 'HTTPValidationError'
} as const;

export const SetupAgentBodySchema = {
    properties: {
        subscription_id: {
            type: 'string',
            title: 'Subscription Id'
        },
        password: {
            type: 'string',
            title: 'Password'
        },
        account: {
            '$ref': '#/components/schemas/SubscriptionAccount'
        }
    },
    type: 'object',
    required: ['subscription_id', 'password', 'account'],
    title: 'SetupAgentBody'
} as const;

export const SubscriptionAccountSchema = {
    properties: {
        address: {
            type: 'string',
            title: 'Address'
        },
        chain: {
            '$ref': '#/components/schemas/SubscriptionChain'
        }
    },
    type: 'object',
    required: ['address', 'chain'],
    title: 'SubscriptionAccount',
    example: {
        address: '0x0000000000000000000000000000000000000000',
        chain: 'base'
    }
} as const;

export const SubscriptionChainSchema = {
    type: 'string',
    enum: ['base', 'solana'],
    title: 'SubscriptionChain',
    description: 'An enumeration.'
} as const;

export const UpdateAgentResponseSchema = {
    properties: {
        instance_hash: {
            type: 'string',
            title: 'Instance Hash'
        }
    },
    type: 'object',
    required: ['instance_hash'],
    title: 'UpdateAgentResponse'
} as const;

export const ValidationErrorSchema = {
    properties: {
        loc: {
            items: {
                anyOf: [
                    {
                        type: 'string'
                    },
                    {
                        type: 'integer'
                    }
                ]
            },
            type: 'array',
            title: 'Location'
        },
        msg: {
            type: 'string',
            title: 'Message'
        },
        type: {
            type: 'string',
            title: 'Error Type'
        }
    },
    type: 'object',
    required: ['loc', 'msg', 'type'],
    title: 'ValidationError'
} as const;