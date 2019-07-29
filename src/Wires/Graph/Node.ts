import { EventEmitter } from 'events';
import {
  ContextRecord,
  ParamAddress,
  ParamData,
  ParamDataCollection,
  TriggersCollection,
} from './types';

export enum Event {
  TRIGGER = 'trigger',
  PARAMETER_REMOVED = 'parameterRemoved',
  OUTPUT_REMOVED = 'outputRemoved',
  STATE_DID_CHANGE = 'stateDidChange',
  TRIGGER_PARAM_ADDED = 'triggerParamAdded',
  VALUED_PARAM_ADDED = 'valuedParamAdded',
  TRIGGER_OUT_ADDED = 'triggerOutAdded',
  VALUED_OUT_ADDED = 'valuedOutAdded',
  NODE_ERROR = 'nodeError',
}

type InterfaceEvent =
  | Event.TRIGGER
  | Event.TRIGGER_PARAM_ADDED
  | Event.VALUED_OUT_ADDED
  | Event.TRIGGER_OUT_ADDED
  | Event.PARAMETER_REMOVED
  | Event.OUTPUT_REMOVED;

export interface NodeConstructor<C = any> {
  new (id: string): Node<C>;
  prototype: Node<C>;
  contexts: ContextRecord<C>;
}

export interface Node<C extends Record<string, any> = any> {
  constructor: NodeConstructor<C>;

  id: string;

  state: ParamDataCollection;

  trigger(name: string): void;
  commitChanges(newState: ParamDataCollection): void;
  getOutputValue(name: string): ParamData;

  on(eventName: Event.TRIGGER, callback: (address: ParamAddress) => void): this;
  on(
    eventName: Event.VALUED_PARAM_ADDED,
    callback: (address: ParamAddress, value: ParamData) => void,
  ): this;
  on(
    eventName: Event.TRIGGER_PARAM_ADDED,
    callback: (address: ParamAddress) => void,
  ): this;
  on(
    eventName: Event.VALUED_OUT_ADDED,
    callback: (address: ParamAddress) => void,
  ): this;
  on(
    eventName: Event.TRIGGER_OUT_ADDED,
    callback: (address: ParamAddress) => void,
  ): this;
  on(
    eventName: Event.PARAMETER_REMOVED,
    callback: (address: ParamAddress) => void,
  ): this;
  on(
    eventName: Event.OUTPUT_REMOVED,
    callback: (address: ParamAddress) => void,
  ): this;
  on(
    eventName: Event.STATE_DID_CHANGE,
    callback: (state: ParamDataCollection) => void,
  ): this;
  on(eventName: Event.NODE_ERROR, callback: (errors: string[]) => void): this;
  on(eventName: never, callback: (...args: any[]) => void): this;

  emit(eventName: Event.TRIGGER, address: ParamAddress): boolean;
  emit(
    eventName: Event.VALUED_PARAM_ADDED,
    address: ParamAddress,
    value: ParamData,
  ): boolean;
  emit(eventName: Event.TRIGGER_PARAM_ADDED, address: ParamAddress): boolean;
  emit(eventName: Event.VALUED_OUT_ADDED, address: ParamAddress): boolean;
  emit(eventName: Event.TRIGGER_OUT_ADDED, address: ParamAddress): boolean;
  emit(eventName: Event.PARAMETER_REMOVED, address: ParamAddress): boolean;
  emit(eventName: Event.OUTPUT_REMOVED, address: ParamAddress): boolean;
  emit(eventName: Event.STATE_DID_CHANGE, state: ParamDataCollection): boolean;
  emit(
    eventName: Event.NODE_ERROR,
    errors: { type: string; message: string }[],
  ): boolean;
  emit(eventName: never, ...args: any[]): boolean;

  nodeDidCreate?(): void;
  nodeDidUpdate?(prevState: ParamDataCollection): void;
  nodeWillUpdate?(nextState: ParamDataCollection): void;
  nodeWillBeDestroyed?(): void;
}

export class Node<C = any> extends EventEmitter {
  static contexts: ContextRecord = {};

  id: string;
  state: ParamDataCollection = {};

  private outputState: ParamDataCollection = {};
  private triggers: TriggersCollection = {};
  private outputTriggers: Set<string> = new Set();

  constructor(id: string) {
    super();

    this.id = id;
  }

  context: Partial<C> = new Proxy(this.constructor.contexts, {
    get<K extends keyof C>(
      target: ContextRecord<C>,
      name: K,
    ): C[K] | undefined {
      if (name in target) {
        return target[name].get();
      }
    },
  }) as Partial<C>;

  getOutputValue(name: string): ParamData {
    return this.outputState[name];
  }

  isParameter(name: string): boolean {
    return name in this.state || name in this.triggers;
  }

  isOutput(name: string): boolean {
    return name in this.outputState || this.outputTriggers.has(name);
  }

  isTrigger(name: string): boolean {
    return name in this.triggers || this.outputTriggers.has(name);
  }

  isValued(name: string): boolean {
    return name in this.state || name in this.outputState;
  }

  checkParameter(name: string, shouldExist: boolean): void {
    if (this.isParameter(name) === shouldExist) {
      return;
    }

    if (shouldExist === true) {
      throw `Node ${this.id}: parameter [${name}] doesn't exist`;
    } else {
      throw `Node ${this.id}: parameter [${name}] is already exist`;
    }
  }

  checkOutput(name: string, shouldExist: boolean): void {
    if (this.isOutput(name) === shouldExist) {
      return;
    }

    if (shouldExist === true) {
      throw `Node ${this.id}: output [${name}] doesn't exist`;
    } else {
      throw `Node ${this.id}: output [${name}] is already exist`;
    }
  }

  trigger(name: string): void {
    this.triggers[name]();
  }

  commitChanges(newState: ParamDataCollection): void {
    const prevState = this.state;
    this.state = {};

    for (const prop in prevState) {
      this.state[prop] = newState[prop];
    }

    this.emit(Event.STATE_DID_CHANGE, this.state);
  }

  addTrigger(name: string, callback: () => void): void {
    this.checkParameter(name, false);

    this.triggers[name] = callback;

    this.emitInterfaceEvent(name, Event.TRIGGER_PARAM_ADDED);
  }

  addParameter(name: string, initialValue: ParamData): void {
    this.checkParameter(name, false);

    this.state[name] = initialValue;

    this.emit(Event.VALUED_PARAM_ADDED, [this.id, name], initialValue);
  }

  addOutTrigger(name: string): void {
    this.checkOutput(name, false);

    this.outputTriggers.add(name);

    this.emitInterfaceEvent(name, Event.TRIGGER_OUT_ADDED);
  }

  addOutValue(name: string, initialValue: ParamData): void {
    this.checkOutput(name, false);

    this.outputState[name] = initialValue;

    this.emitInterfaceEvent(name, Event.VALUED_OUT_ADDED);
  }

  private emitInterfaceEvent(name: string, event: InterfaceEvent): void {
    const address: ParamAddress = [this.id, name];
    this.emit(event as any, address);
  }

  sendOut(name: string, value: ParamData): void {
    if (!(name in this.outputState)) {
      throw `Node ${this.id}: valued output [${name}] doesn't exist`;
    }

    this.outputState[name] = value;

    this.emitInterfaceEvent(name, Event.TRIGGER);
  }

  triggerOut(name: string): void {
    if (!this.outputTriggers.has(name)) {
      throw `Node ${this.id}: output trigger [${name}] doesn't exist`;
    }

    this.emitInterfaceEvent(name, Event.TRIGGER);
  }

  removeParameter(name: string): void {
    if (name in this.state) {
      delete this.state[name];
      this.emitInterfaceEvent(name, Event.PARAMETER_REMOVED);
    } else if (name in this.triggers) {
      delete this.triggers[name];
      this.emitInterfaceEvent(name, Event.PARAMETER_REMOVED);
    } else {
      throw `Node ${this.id}: parameter [${name}] doesn't exist`;
    }
  }

  removeOutput(name: string): void {
    if (name in this.outputState) {
      delete this.outputState[name];
      this.emitInterfaceEvent(name, Event.OUTPUT_REMOVED);
    } else if (this.outputTriggers.has(name)) {
      this.outputTriggers.delete(name);
      this.emitInterfaceEvent(name, Event.OUTPUT_REMOVED);
    } else {
      throw `Node ${this.id}: output [${name}] doesn't exist`;
    }
  }
}
