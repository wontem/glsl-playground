import { Node } from '../../Graph/Node';
import { ContextRecord } from '../../Graph/types';
import { GLStateContext } from '../contexts';
import { GLState } from '../modules/GLState';

type C = {
  glState: GLState;
};

// export interface GL<
//   State extends ParamDataCollection,
//   Trigger extends string,
//   OutValued extends ParamDataCollection,
//   OutTrigger extends string
// > extends Operator<State, Trigger, OutValued, OutTrigger, C>, Node {}

export abstract class GL extends Node<C> {
  static contexts: ContextRecord<C> = {
    glState: GLStateContext,
  };

  get glState(): GLState {
    if (this.context.glState) {
      return this.context.glState;
    }

    throw 'GL context is undefined';
  }

  get gl(): WebGL2RenderingContext {
    return this.glState.gl;
  }
}
