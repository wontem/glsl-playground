import { Node } from './Node';
import { ParamDataCollection } from './types';

// TODO: think how to apply it

export interface Operator<
  State extends ParamDataCollection,
  Trigger extends string,
  OutValued extends ParamDataCollection,
  OutTrigger extends string,
  Context extends Record<string, any>
> extends Node<Context> {
  state: State;

  addOutValue<P extends keyof OutValued>(
    param: P,
    initialValue: OutValued[P],
  ): void;
  sendOut<P extends keyof OutValued>(param: P, value: OutValued[P]): void;
  getOutputValue<P extends keyof OutValued>(name: P): OutValued[P];

  addOutTrigger(name: OutTrigger): void;
  triggerOut(name: OutTrigger): void;

  addParameter<P extends keyof State>(param: P, initialValue: State[P]): void;
  addTrigger(name: Trigger, callback: () => void): void;
  trigger(name: Trigger): void;

  nodeDidUpdate?(prevState: State): void;

  removeParameter(name: keyof State | Trigger): void;
  removeOutput(name: keyof OutValued | OutTrigger): void;
}
