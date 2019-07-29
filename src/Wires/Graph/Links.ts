import { ParamAddress } from './types';

function deepSet<C extends any, T>(
  obj: C,
  path: string[],
  setter: (currentValue: T) => T,
): C {
  path.reduce((obj, p, index, path) => {
    const next = index === path.length - 1 ? setter(obj[p]) : obj[p] || {};
    obj[p] = next;
    return next;
  }, obj);

  return obj;
}

function deepGet<T>(obj: Record<string, any>, path: string[]): T | undefined {
  let currentItem = obj;

  for (const p of path) {
    if (p in currentItem) {
      currentItem = currentItem[p];
    } else {
      return;
    }
  }

  return (currentItem as unknown) as T;
}

function link(state: State, output: ParamAddress, input: ParamAddress): void {
  deepSet(state, [...output, ...input], () => {
    // TODO: good place for active/inactive state
    // JSON.stringify will skip undefined prop
  });
}

export interface Links extends Iterable<[ParamAddress, ParamAddress]> {
  forEach(callback: (addresses: [ParamAddress, ParamAddress]) => void): void;
  has(output: ParamAddress, input: ParamAddress): boolean;
  add(output: ParamAddress, input: ParamAddress): void;
  remove(output: ParamAddress, input: ParamAddress): void;
  removeLinksForInput(address: ParamAddress): void;
  removeLinksForOutput(address: ParamAddress): void;
  removeLinksForNode(nodeId: string): void;
  getLinkedInputs(output: ParamAddress): ParamAddress[];
  clear(): void;
}

type State = Record<
  string,
  Record<string, Record<string, Record<string, never>>>
>;

export class Links {
  private state: State = {};

  *[Symbol.iterator](): IterableIterator<[ParamAddress, ParamAddress]> {
    for (const outputNodeId in this.state) {
      const portLinks = this.state[outputNodeId];
      for (const outputPortId in portLinks) {
        const inputNodes = portLinks[outputPortId];
        for (const inputNodeId in inputNodes) {
          const inputPorts = inputNodes[inputNodeId];
          for (const inputPortId in inputPorts) {
            yield [[outputNodeId, outputPortId], [inputNodeId, inputPortId]];
          }
        }
      }
    }
  }

  forEach(callback: (addresses: [ParamAddress, ParamAddress]) => void): void {
    for (const addresses of this) {
      callback(addresses);
    }
  }

  clear(): void {
    this.state = {};
  }

  has(
    [outputNodeId, outputPortId]: ParamAddress,
    [inputNodeId, inputPortId]: ParamAddress,
  ): boolean {
    try {
      return inputPortId in this.state[outputNodeId][outputPortId][inputNodeId];
    } catch (error) {
      return false;
    }
  }

  add(output: ParamAddress, input: ParamAddress): void {
    link(this.state, output, input);
  }

  // TODO: check performance
  remove(output: ParamAddress, input: ParamAddress): void {
    const hash = [...output, ...input].join();
    const newState: State = {};

    for (const [output, input] of this) {
      if (hash !== [...output, ...input].join()) {
        link(newState, output, input);
      }
    }

    this.state = newState;
  }

  // TODO: check performance
  removeLinksForInput(address: ParamAddress): void {
    const hash = address.join();
    const newState = {};

    for (const [output, input] of this) {
      if (hash !== input.join()) {
        link(newState, output, input);
      }
    }

    this.state = newState;
  }

  // TODO: check performance
  removeLinksForOutput(address: ParamAddress): void {
    const hash = address.join();
    const newState: State = {};

    for (const [output, input] of this) {
      if (hash !== output.join()) {
        link(newState, output, input);
      }
    }

    this.state = newState;
  }

  // TODO: check performance
  removeLinksForNode(nodeId: string): void {
    const newState: State = {};

    for (const [output, input] of this) {
      if (nodeId !== output[0] && nodeId !== input[0]) {
        link(newState, output, input);
      }
    }

    this.state = newState;
  }

  getLinkedInputs(output: ParamAddress): ParamAddress[] {
    const addresses: ParamAddress[] = [];
    const inputs: undefined | Record<string, Record<string, never>> = deepGet(
      this.state,
      output,
    );

    if (!inputs) {
      return addresses;
    }

    for (const nodeId in inputs) {
      const portLinks = inputs[nodeId];
      for (const portId in portLinks) {
        addresses.push([nodeId, portId]);
      }
    }

    return addresses;
  }
}
