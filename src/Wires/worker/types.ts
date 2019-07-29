import { ParamAddress, ParamDataCollection } from '../Graph/types';
import { OperatorType } from './OperatorCreators/types';

interface SimpleMessage<T extends string> {
  type: T;
}

interface Message<T extends string, P> extends SimpleMessage<T> {
  payload: P;
}

export enum IncomingMessageType {
  INIT = 'init',
  CLEAR = 'clear',
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
  CREATE_NODE = 'createNode',
  DELETE_NODE = 'deleteNode',
  CREATE_LINK = 'createLink',
  DELETE_LINK = 'deleteLink',
  SET_NODE_PARAMETERS = 'setNodeParameters',
  USE_PROJECT = 'useProject',
}

type ClearMessage = SimpleMessage<IncomingMessageType.CLEAR>;
type ActivateMessage = SimpleMessage<IncomingMessageType.ACTIVATE>;
type DeactivateMessage = SimpleMessage<IncomingMessageType.DEACTIVATE>;
type InitMessage = Message<IncomingMessageType.INIT, OffscreenCanvas>;

type CreateNodeMessage = Message<
  IncomingMessageType.CREATE_NODE,
  {
    id: string;
    type: OperatorType;
  }
>;

type DeleteNodeMessage = Message<IncomingMessageType.DELETE_NODE, string>;

type CreateLinkMessage = Message<
  IncomingMessageType.CREATE_LINK,
  {
    output: ParamAddress;
    input: ParamAddress;
  }
>;

type DeleteLinkMessage = Message<
  IncomingMessageType.DELETE_LINK,
  {
    output: ParamAddress;
    input: ParamAddress;
  }
>;

type SetNodeParametersMessage = Message<
  IncomingMessageType.SET_NODE_PARAMETERS,
  { id: string; parameters: ParamDataCollection }
>;

type UseProject = Message<IncomingMessageType.USE_PROJECT, ArrayBuffer>;

export type IncomingMessage =
  | UseProject
  | InitMessage
  | ClearMessage
  | ActivateMessage
  | DeactivateMessage
  | CreateNodeMessage
  | DeleteNodeMessage
  | CreateLinkMessage
  | DeleteLinkMessage
  | SetNodeParametersMessage;
