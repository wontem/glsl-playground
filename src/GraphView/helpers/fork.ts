import { NodeStore } from '../stores/NodeStore';
import { PortStore } from '../stores/PortStore';

interface Config<T> {
  node?: (node: NodeStore) => void;
  port?: (port: PortStore) => void;
  default?: (item: T) => void;
}

export const fork = <T>(item: T, config: Config<T>): void => {
  if (item instanceof PortStore) {
    config.port && config.port(item);
  } else if (item instanceof NodeStore) {
    config.node && config.node(item);
  } else {
    config.default && config.default(item);
  }
}
