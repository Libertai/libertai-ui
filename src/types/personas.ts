import { Persona } from '@libertai/libertai-js';

export type UIPersona = Persona & {
  id: string;
  avatar: {
    item_hash: string;
    ipfs_hash: string;
  };
  name: string;
  allowEdit: boolean;
  hidden: boolean;
  knowledgeBases: string[]; // IDs of linked knowledge bases
};

export type BasePersonaEdition = Pick<UIPersona, 'name' | 'role' | 'description' | 'avatar'>;

export const defaultBasePersona: BasePersonaEdition = {
  name: '',
  role: '',
  description: '',
  avatar: {
    item_hash: '90db3237796d27118e0b9e21dae10a4b1179878f869cb6c0058d0d7c00b0440d',
    ipfs_hash: 'QmQMBfgnmuxcQ4kptR1oPE9guYxG13GpASjYVeFQSxNxjE',
  },
};

// eslint-disable-next-line no-unused-vars
export type PersonaMigration = (currentPersona: UIPersona) => UIPersona;
