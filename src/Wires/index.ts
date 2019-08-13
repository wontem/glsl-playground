import { ParamAddress } from './Graph/types';
import { OperatorType } from './worker/OperatorCreators/types';
import { IncomingMessage, IncomingMessageType } from './worker/types';

interface WiresWorker extends Worker {
  postMessage(message: IncomingMessage, transfer?: Transferable[]): void;
  postMessage(message: IncomingMessage, options?: PostMessageOptions): void;
}

export class Wires {
  private worker: WiresWorker = new Worker('./worker/index.ts', {
    type: 'module',
  });

  init(canvas: HTMLCanvasElement): void {
    const offscreenCanvas: OffscreenCanvas = canvas.transferControlToOffscreen();

    this.worker.postMessage(
      { type: IncomingMessageType.INIT, payload: offscreenCanvas },
      [(offscreenCanvas as unknown) as Transferable],
    );
  }

  clear(): void {
    this.worker.postMessage({ type: IncomingMessageType.CLEAR });
  }

  activate(): void {
    this.worker.postMessage({ type: IncomingMessageType.ACTIVATE });
  }

  deactivate(): void {
    this.worker.postMessage({ type: IncomingMessageType.DEACTIVATE });
  }

  createNode(id: string, type: OperatorType): void {
    this.worker.postMessage({
      type: IncomingMessageType.CREATE_NODE,
      payload: {
        id,
        type,
      },
    });
  }

  createLink(output: ParamAddress, input: ParamAddress): void {
    this.worker.postMessage({
      type: IncomingMessageType.CREATE_LINK,
      payload: {
        output,
        input,
      },
    });
  }

  useProject(projectFile: ArrayBuffer): void {
    this.worker.postMessage(
      {
        type: IncomingMessageType.USE_PROJECT,
        payload: projectFile,
      },
      [projectFile],
    );
  }

  terminate(): void {
    this.worker.terminate();
  }
}

// INIT = 'init',
// CLEAR = 'clear',
// ACTIVATE = 'activate',
// DEACTIVATE = 'deactivate',

// CREATE_NODE = 'createNode',
// DELETE_NODE = 'deleteNode',
// CREATE_LINK = 'createLink',
// DELETE_LINK = 'deleteLink',
// SET_NODE_PARAMETERS = 'setNodeParameters',
