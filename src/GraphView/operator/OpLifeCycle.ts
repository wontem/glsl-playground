import { clearImmediate, setImmediate } from 'core-js/web/immediate';
import { action, observable } from 'mobx';
import { PortType } from '../constants';
import { OpNodeStore } from '../stores/OpNodeStore';
import { PortalPortStore } from '../stores/PortalPortStore';
import { PortStore } from '../stores/PortStore';
import { IDataTypes, PortDataType } from './constants';

type Trigger = () => void;
type IOTypes = Record<string, PortDataType>;
export type IOState<T extends IOTypes = IOTypes> = {
  [K in keyof T]: IDataTypes[T[K]]
};

export abstract class OpLifeCycle {
  private initialized: boolean = false;
  private readonly defaultState: IOState = {};
  private newState: Partial<IOState> = {};
  @observable public state: IOState = {};
  @observable public outputState: IOState = {};
  @observable public parameters: IOState = {};

  get name(): string {
    return this.node.label;
  }

  set name(name: string) {
    this.node.label = name;
  }

  get inputs(): [string, PortStore<PortType.INPUT>][] {
    const inputs = this.portIds[PortType.INPUT];
    return Object.keys(inputs).map((name) => [name, inputs[name]]);
  }

  get outputs(): [string, PortStore<PortType.OUTPUT>][] {
    const outputs = this.portIds[PortType.OUTPUT];
    return Object.keys(outputs).map((name) => [name, outputs[name]]);
  }

  // private readonly outState: IOState<ExcludeTrigger<O>> = {} as any;

  private readonly portIds: {
    [PortType.INPUT]: Record<string, PortStore<PortType.INPUT>>;
    [PortType.OUTPUT]: Record<string, PortStore<PortType.OUTPUT>>;
  } = {
    [PortType.INPUT]: {},
    [PortType.OUTPUT]: {},
  };

  private readonly portNames: WeakMap<PortStore, string> = new WeakMap();

  public getPortByName(
    type: PortType.INPUT,
    name: string,
  ): PortStore<PortType.INPUT>;

  public getPortByName(
    type: PortType.OUTPUT,
    name: string,
  ): PortStore<PortType.OUTPUT>;

  public getPortByName(type: PortType, name: string): PortStore {
    return this.portIds[type][name];
  }

  public getNameByPort(port: PortStore): string | undefined {
    return this.portNames.get(port);
  }

  constructor(private readonly node: OpNodeStore) {
    node.op = this;
    this.scheduleUpdate();
  }

  @action
  private addPort(
    type: PortType,
    dataType: PortDataType,
    name: string,
    label?: string,
  ) {
    const port = new PortStore(this.node, type, dataType);
    this.node.addPort(port);

    this.portIds[type][name] = port;
    this.portNames.set(port, name);
  }

  @action
  protected addSelectPort(
    name: string,
    options: string[],
    defaultValue: string,
    label?: string,
  ) {
    this.parameters[name] = options;
    this.addPort(PortType.INPUT, PortDataType.SELECT, name, label);
    this.defaultState[name] = defaultValue;
    if (!this.state.hasOwnProperty(name)) {
      this.state[name] = defaultValue;
    }
  }

  @action
  protected addInPort<T extends PortDataType>(
    name: string,
    type: T,
    defaultValue: IDataTypes[T],
    label?: string,
  ): void {
    this.addPort(PortType.INPUT, type, name, label);
    this.defaultState[name] = defaultValue;
    if (!this.state.hasOwnProperty(name)) {
      this.state[name] = defaultValue;
    }
  }

  @action
  protected addOutPort<T extends PortDataType>(
    name: string,
    type: T,
    initialValue: IDataTypes[T],
    label?: string,
  ): void {
    this.addPort(PortType.OUTPUT, type, name, label);
    if (!this.outputState.hasOwnProperty(name)) {
      this.outputState[name] = initialValue;
    }
  }

  @action
  protected addInTrigger(
    name: string,
    onTrigger: Trigger,
    label?: string,
  ): void {
    this.addPort(PortType.INPUT, PortDataType.TRIGGER, name, label);
    this.state[name] = onTrigger;
  }

  @action
  protected addOutTrigger(name: string, label?: string): void {
    this.addPort(PortType.OUTPUT, PortDataType.TRIGGER, name, label);
  }

  // private removePort(type: PortType, name: string): void {
  //   const Port = this.getPortByName(type, name);
  //   this.node.addPort(port);

  //   this.portIds[type][name] = port;
  //   this.portNames.set(port, name);
  // }

  // FIXME: implement it
  protected removeIn(name: string): void {
    // this.removePort(PortType.INPUT, name);
  }

  // FIXME: implement it
  protected removeOut(name: string): void {}

  private forEachLinkedOutPort(
    name: string,
    callback: (op: OpLifeCycle, name: string) => void,
  ) {
    const outPort = this.getPortByName(PortType.OUTPUT, name);

    const ports: Set<PortStore> = new Set();

    const recursiveWalk = (port: PortStore) => {
      if (port instanceof PortalPortStore) {
        port.portalPorts && port.portalPorts.forEach(recursiveWalk);
      } else {
        ports.add(port);
      }
    };

    outPort.linkedPorts && outPort.linkedPorts.forEach(recursiveWalk);

    ports.forEach((port) => {
      const op = (port.node as OpNodeStore).op;
      const inName = op.portNames.get(port)!;
      callback(op, inName);
    });
  }

  @action
  public sendOutPortValue(name: string, value: any): void {
    this.outputState[name] = value;

    this.forEachLinkedOutPort(name, (op, inName) => {
      op.setInValue(inName, value);
    });
  }

  @action
  public updateInputState(newState: Partial<IOState>) {
    this.newState = { ...this.newState, ...newState };
    this.isDirty = true;
    this.scheduleUpdate();
  }

  @action
  public updateOutputState(newState: Partial<IOState>) {
    Object.keys(newState).forEach((key) => {
      this.sendOutPortValue(key, newState[key]);
    });
  }

  public triggerIn(name: string): void {
    this.triggersCallOrder.add(name);
    this.scheduleUpdate();
  }

  public triggerOut(name: string): void {
    this.forEachLinkedOutPort(name, (op, inName) => {
      op.triggerIn(inName);
    });
  }

  @action
  public setInValue(name: string, value: any): void {
    this.newState[name] = value;
    this.isDirty = true;
    this.scheduleUpdate();
  }

  private isDirty: boolean = false;
  private triggersCallOrder: Set<string> = new Set();
  private updateTimer!: number | undefined;
  private scheduleUpdate(): void {
    if (typeof this.updateTimer === 'undefined') {
      this.updateTimer = setImmediate(this.performUpdate);
    }
  }

  private performUpdate = action(() => {
    if (this.isDirty || !this.initialized) {
      const prevState = this.state;
      this.state = { ...prevState, ...this.newState };
      this.newState = {};

      if (!this.initialized) {
        this.opDidCreate && this.opDidCreate();
        this.initialized = true;
      } else {
        this.opDidUpdate && this.opDidUpdate(prevState);
      }
    }

    this.triggersCallOrder.forEach((name) => {
      // console.debug(`${this.name}: out trigger: ${name}`);
      const trigger: Trigger = this.state[name];
      trigger();
    });

    this.updateTimer = undefined;
    this.triggersCallOrder.clear();
    this.isDirty = false;
  });

  destroy(): void {
    if (typeof this.updateTimer !== 'undefined') {
      clearImmediate(this.updateTimer);
    }
    this.opWillBeDestroyed && this.opWillBeDestroyed();
  }

  // TODO: move it into interface
  opDidUpdate(prevState: IOState): void {}

  // TODO: move it into interface
  opDidCreate(): void {}

  // TODO: move it into interface
  opWillBeDestroyed(): void {}
}

export class OpLogger extends OpLifeCycle {
  name = 'Logger';

  constructor(node: OpNodeStore) {
    super(node);

    this.addInPort('data', PortDataType.NUMBER, 0);
  }

  opDidUpdate() {
    // console.log(this.state.data);
  }
}

export class OpCounter extends OpLifeCycle {
  name = 'Counter';
  count: number = 0;

  constructor(node: OpNodeStore) {
    super(node);

    this.addInTrigger('reset', () => {
      this.count = 0;
      this.sendOutPortValue('count', this.count);
    });

    this.addInTrigger('increment', () => {
      this.count += 1;
      this.sendOutPortValue('count', this.count);
    });

    this.addInTrigger('decrement', () => {
      this.count -= 1;
      this.sendOutPortValue('count', this.count);
    });

    this.addOutPort('count', PortDataType.NUMBER, this.count);
  }
}
