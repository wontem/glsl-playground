import { EventEmitter } from 'events';

// TODO: get callback interface from setter
type Callback<A extends any[]> = (...args: A) => void;

export interface Looper<A extends any[]> {
  toggleActive(isActive: boolean): void;
  start(): void;
  stop(): void;

  on(event: 'tick', cb: Callback<A>): this;
}

export class Looper<A, T = any> extends EventEmitter {
  private timerId?: T;

  constructor(
    private setTimer: (callback: Callback<A>) => T,
    private clearTimer: (timer: T) => void,
  ) {
    super();
  }

  private schedule(): void {
    this.timerId = this.setTimer((...args) => {
      this.schedule();
      // TODO: check performance with setImmediate
      this.emit('tick', ...args);
    });
  }

  get isActive(): boolean {
    return typeof this.timerId !== 'undefined';
  }

  toggleActive(isActive: boolean): void {
    if (isActive !== this.isActive) {
      if (isActive) {
        this.schedule();
      } else {
        this.clearTimer(this.timerId!);
        this.timerId = undefined;
      }
    }
  }

  start(): void {
    this.toggleActive(true);
  }

  stop(): void {
    this.toggleActive(false);
  }
}
