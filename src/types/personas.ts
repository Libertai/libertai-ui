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
};
