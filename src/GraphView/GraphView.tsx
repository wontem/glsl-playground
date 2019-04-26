import * as React from 'react';

import { GraphStore } from '../GraphView/stores/GraphStore';
import { Patch } from '../GraphView/components/Patch';
import { ViewStateStore } from './stores/ViewStateStore';
import { PortColors } from './operator/constants';

const graph = new GraphStore({
  colors: PortColors,
});
const viewState = new ViewStateStore(graph);

viewState.width = 1024;
viewState.height = 640;

export const GraphView: React.FC = () => (
  <Patch viewState={viewState} />
);
