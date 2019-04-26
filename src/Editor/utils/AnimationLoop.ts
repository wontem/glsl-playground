
import { EventEmitter } from 'events';

export class AnimationLoop extends EventEmitter {
  private fps: number;
  private fpsBeginTime: number;
  private fpsPrevTime: number;
  private fpsFramesElapsed: number;

  private isPlaying: boolean;
  private frameId: number;

  constructor() {
    super();

    this.isPlaying = false;
    this.frameId = null;

    this.fpsReset();
  }

  private fpsBegin(): void {
    this.fpsBeginTime = performance.now();
  }

  private fpsEnd(): void {
    const time = performance.now();
    this.fpsFramesElapsed += 1;

    if (time >= this.fpsPrevTime + 1000) {
      this.fps = (this.fpsFramesElapsed * 1000) / (time - this.fpsPrevTime);

      this.fpsPrevTime = time;
      this.fpsFramesElapsed = 0;
    }
  }

  private loop(): void {
    this.fpsBegin();

    this.emit('tick');

    this.frameId = requestAnimationFrame(() => {
      this.fpsEnd();
      this.loop();
    });
  }

  getFPS(): number {
    return this.fps;
  }

  private fpsReset(): void {
    this.fps = 0;
    this.fpsFramesElapsed = 0;
    this.fpsBeginTime = performance.now();
    this.fpsPrevTime = this.fpsBeginTime;
  }

  togglePlay(isPlaying: boolean) {
    if (isPlaying !== this.isPlaying) {
      this.isPlaying = isPlaying;

      if (isPlaying) {
        this.loop();
      } else {
        cancelAnimationFrame(this.frameId);
        this.fpsReset();
        this.frameId = null;
      }
    }
  }
}
