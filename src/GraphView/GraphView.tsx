import * as React from 'react';

import { Patch } from '../GraphView/components/Patch';
import { GraphStore } from '../GraphView/stores/GraphStore';
import { PortColors } from './operator/constants';
import { Panel } from './panelComponents/Panel';
import { ViewStateStore } from './stores/ViewStateStore';

const graph = new GraphStore({
  colors: PortColors,
});
const viewState = new ViewStateStore(graph);

viewState.width = 1024;
viewState.height = 640;

export const GraphView: React.FC = () => (
  <>
    <Patch viewState={viewState} />
    <Panel viewState={viewState} />
  </>
);
