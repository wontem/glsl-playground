import { EventEmitter } from 'events';

export interface Context<T = any> extends EventEmitter {
  set(value: T): void;
  get(): T | undefined;
  trigger(): void;
  on(event: 'update', callback: (value: this) => void): this;
  off(event: 'update', callback: (value: this) => void): this;
}

export class Context<T> extends EventEmitter {
  private value?: T;

  set(value: T): void {
    if (this.value !== value) {
      this.value = value;
      this.trigger();
    }
  }

  get(): T | undefined {
    return this.value;
  }

  trigger() {
    this.emit('update', this);
  }
}
