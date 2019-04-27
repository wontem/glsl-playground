import { setImmediate } from 'core-js/web/immediate';
import { AnimationLoop } from '../../Editor/utils/AnimationLoop';
import { PortType } from '../constants';
import { NodeStore } from '../stores/NodeStore';
import { OpNodeStore } from '../stores/OpNodeStore';
import { PortalPortStore } from '../stores/PortalPortStore';
import { PortStore } from '../stores/PortStore';
import { IDataTypes, PortDataType } from './constants';

type FilterFlags<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? Key : never
};

type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[keyof Base];

type SubType<Base, Condition> = Pick<Base, AllowedNames<Base, Condition>>;

type IOTypes = Record<string, PortDataType>;
type IOState<T extends IOTypes> = {
  [K in keyof T]: Readonly<IDataTypes[T[K]]>
};
type ExcludeTrigger<T extends IOTypes> = SubType<
  T,
  Exclude<PortDataType, PortDataType.TRIGGER>
>;
type ExtractTrigger<T extends IOTypes> = SubType<T, PortDataType.TRIGGER>;

type ShaderInputTypes =
  | Record<string, PortDataType.TEXTURE>
  | Record<string, PortDataType.BOOL>
  | Record<string, PortDataType.FLOAT>
  | Record<string, PortDataType.INT>
  | Record<string, PortDataType.VEC2>
  | Record<string, PortDataType.VEC3>
  | Record<string, PortDataType.VEC4>;

export abstract class OpLifeCycle<
  I extends IOTypes = IOTypes,
  O extends IOTypes = IOTypes,
  C = any
> {
  private readonly defaultState: IOState<I> = {} as IOState<I>;
  private newState: Partial<IOState<I>> = {};
  protected state: IOState<I> = {} as IOState<I>;

  get name(): string {
    return this.node.label;
  }

  set name(name: string) {
    this.node.label = name;
  }

  // private readonly outState: IOState<ExcludeTrigger<O>> = {} as any;

  private readonly portIds: {
    [PortType.INPUT]: Record<keyof I, PortStore>;
    [PortType.OUTPUT]: Record<keyof O, PortStore>;
  } = {
    [PortType.INPUT]: {} as any,
    [PortType.OUTPUT]: {} as any,
  };

  private readonly portNames: WeakMap<
    PortStore,
    (keyof I | keyof O) & string
  > = new WeakMap();

  private getPortByName(
    type: PortType.INPUT,
    name: keyof I,
  ): PortStore<PortType.INPUT>;
  private getPortByName(
    type: PortType.OUTPUT,
    name: keyof O,
  ): PortStore<PortType.OUTPUT>;
  private getPortByName(type: PortType, name: string): PortStore {
    return this.portIds[type][name];
  }

  constructor(
    private readonly node: OpNodeStore,
    private context?: Readonly<C>,
  ) {
    node.op = this as any; // FIXME: fix any
  }

  private addPort(type: PortType, dataType: PortDataType, name: string) {
    const port = new PortStore(this.node, type, dataType);
    this.node.addPort(port);

    this.portIds[type][name] = port;
    this.portNames.set(port, name);
  }

  protected addInPort<
    F extends ExcludeTrigger<I>,
    K extends keyof ExcludeTrigger<I> & string,
    T extends F[K]
  >(name: K, type: T, defaultValue: IDataTypes[T]): void {
    this.addPort(PortType.INPUT, type, name);
    this.defaultState[name] = defaultValue;
    this.setInValue(name, defaultValue);
  }

  protected addOutPort<F extends ExcludeTrigger<O>, K extends keyof F & string>(
    name: K,
    type: F[K],
  ): void {
    this.addPort(PortType.OUTPUT, type, name);
  }

  protected addInTrigger<
    F extends ExtractTrigger<I>,
    K extends keyof F & string
  >(name: K, onTrigger: Readonly<() => void>): void {
    this.addPort(PortType.INPUT, PortDataType.TRIGGER, name);
    this.state[name] = onTrigger;
  }

  protected addOutTrigger(
    name: AllowedNames<O, PortDataType.TRIGGER> & string,
  ): void {
    this.addPort(PortType.OUTPUT, PortDataType.TRIGGER, name);
  }

  // FIXME: implement it
  protected removeIn(name: keyof I & string): void {}

  // FIXME: implement it
  protected removeOut(name: keyof O & string): void {}

  private forEachLinkedOutPort(
    name: keyof O,
    callback: (op: OpLifeCycle<any, any>, name: string) => void,
  ) {
    const outPort = this.getPortByName(PortType.OUTPUT, name);

    const ports: Set<PortStore> = new Set();

    const recursiveTransform = (port: PortStore) => {
      if (port instanceof PortalPortStore) {
        port.portalPorts && port.portalPorts.forEach(recursiveTransform);
      } else {
        ports.add(port);
      }
    };

    outPort.linkedPorts && outPort.linkedPorts.forEach(recursiveTransform);

    ports.forEach((port) => {
      const op = (port.node as OpNodeStore).op;
      const inName = op.portNames.get(port)!;
      callback(op, inName);
    });
  }

  protected sendOutPortValue<K extends keyof ExcludeTrigger<O>>(
    name: K & string,
    value: IDataTypes[O[K]],
  ): void {
    this.forEachLinkedOutPort(name, (op, inName) => {
      op.setInValue(inName, value);
    });
  }

  triggerIn(name: keyof ExtractTrigger<I> & string): void {
    this.triggersCallOrder.add(name);
    this.scheduleUpdate();
  }

  protected triggerOut(name: keyof ExtractTrigger<O> & string): void {
    this.forEachLinkedOutPort(name, (op, inName) => {
      op.triggerIn(inName);
    });
  }

  setInValue<K extends keyof ExcludeTrigger<I> & string>(
    name: K,
    value: IDataTypes[I[K]],
  ): void {
    this.newState[name] = value;
    this.isDirty = true;
    this.scheduleUpdate();
  }

  private isDirty: boolean = false;
  private triggersCallOrder: Set<keyof ExtractTrigger<I> & string> = new Set();
  private updateTimer!: number | undefined;
  private scheduleUpdate(): void {
    if (typeof this.updateTimer === 'undefined') {
      this.updateTimer = setImmediate(this.performUpdate);
    }
  }

  private performUpdate = () => {
    if (this.isDirty) {
      const prevState = this.state;
      this.state = { ...prevState, ...this.newState };
      this.newState = {};
      this.opDidUpdate && this.opDidUpdate(prevState);
    }

    this.triggersCallOrder.forEach((name) => {
      const trigger: () => void = this.state[name] as any; // TODO: fix any
      trigger();
    });

    this.updateTimer = undefined;
    this.triggersCallOrder.clear();
    this.isDirty = false;
  }

  destroy(): void {
    this.opWillBeDestroyed && this.opWillBeDestroyed();
  }

  // TODO: move it into interface
  opDidUpdate(prevState: IOState<I>): void {}

  opWillBeDestroyed(): void {}
}

export class OpAnimationLoop extends OpLifeCycle<
  {
    isActive: PortDataType.BOOL;
  },
  {
    tick: PortDataType.TRIGGER;
  }
> {
  name = 'AnimationLoop';
  private loop = new AnimationLoop();

  constructor(node: OpNodeStore) {
    super(node);

    this.addInPort('isActive', PortDataType.BOOL, true);
    this.addOutTrigger('tick');

    this.loop.on('tick', () => this.triggerOut('tick'));
  }

  opDidUpdate(
    prevState: IOState<{
      isActive: PortDataType.BOOL;
    }>,
  ) {
    if (prevState.isActive !== this.state.isActive) {
      this.loop.togglePlay(this.state.isActive);
    }
  }

  opWillBeDestroyed() {
    this.loop.removeAllListeners('tick');
  }
}

export class OpLogger extends OpLifeCycle<
  {
    log: PortDataType.TRIGGER;
    data: PortDataType.INT; // TODO: maybe use any
  },
  never
> {
  name = 'Logger';

  constructor(node: OpNodeStore) {
    super(node);

    this.addInPort('data', PortDataType.INT, 0);
  }

  opDidUpdate() {
    console.log(this.state.data);
  }
}

export class OpCounter extends OpLifeCycle<
  {
    increment: PortDataType.TRIGGER;
    decrement: PortDataType.TRIGGER;
  },
  {
    count: PortDataType.INT;
  }
> {
  name = 'Counter';
  count: number = 0;

  constructor(node: OpNodeStore) {
    super(node);

    this.addInTrigger('increment', () => {
      this.count += 1;
      this.sendOutPortValue('count', this.count);
    });

    this.addInTrigger('decrement', () => {
      this.count -= 1;
      this.sendOutPortValue('count', this.count);
    });

    this.addOutPort('count', PortDataType.INT);
  }
}

export class OpBuffer extends OpLifeCycle<
  | {
    render: PortDataType.TRIGGER;
    fragment: PortDataType.STRING;
    vertex: PortDataType.STRING;
  }
  | ShaderInputTypes,
  {
    texture: PortDataType.TEXTURE;
  }
> {
  name = 'Buffer';

  constructor(node: OpNodeStore) {
    super(node);

    this.addInTrigger('render', () => {});
    this.addInPort('fragment', PortDataType.STRING, '');
    this.addInPort('vertex', PortDataType.STRING, '');

    this.addOutPort('texture', PortDataType.TEXTURE);
  }
}
