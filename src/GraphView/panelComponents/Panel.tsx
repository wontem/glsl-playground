import { observer } from 'mobx-react-lite';
import * as reakit from 'reakit';

import * as React from 'react';
import { OpNodeStore } from '../stores/OpNodeStore';
import { ViewStateStore } from '../stores/ViewStateStore';

export const NodeInfo: React.FC<{ node: OpNodeStore }> = observer(
  ({ node }) => {
    const ports = Object.keys(node.op.state).map((portName) => {
      return (
        <div key={portName}>
          <div>{portName}</div>
          <div>{JSON.stringify(node.op.state[portName])}</div>
        </div>
      );
    });

    return (
      <div>
        <div>{node.label}</div>
        {ports}
      </div>
    );
  },
);

export const Panel: React.FC<{ viewState: ViewStateStore }> = observer(
  ({ viewState }) => {
    const selectedNodes = viewState.selectedNodes;

    let result: any = `Selected nodes: ${selectedNodes.size}`;

    if (selectedNodes.size === 1) {
      const selectedNode = [...selectedNodes][0];

      if (selectedNode instanceof OpNodeStore) {
        result = <NodeInfo node={selectedNode} />;
      }
    }

    return (
      <div style={{ color: 'white', zIndex: 999, position: 'absolute' }}>
        {result}
      </div>
    );
  },
);
