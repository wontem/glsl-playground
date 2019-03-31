import * as React from 'react';

import { GraphStore } from '../GraphView/stores/GraphStore';
import { Patch } from '../GraphView/components/Patch';
import { ViewStateStore } from './stores/ViewStateStore';

const graph = new GraphStore();
const viewState = new ViewStateStore();

viewState.width = 1024;
viewState.height = 640;

export const GraphView: React.FC = () => (
  <Patch
    graph={graph}
    viewState={viewState}
  />
);
