import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { Box, Button, Checkbox, Separator } from 'reakit';
import styled from 'styled-components';
import { PortType } from '../constants';
import { PortDataType } from '../operator/constants';
import { OpLifeCycle } from '../operator/OpLifeCycle';
import { OpNodeStore } from '../stores/OpNodeStore';
import { PortStore } from '../stores/PortStore';
import { ViewStateStore } from '../stores/ViewStateStore';
import { Number } from './Number';

const Title = styled(Box)`
  font-weight: bold;
  text-align: center;
  padding: 10px;
`;

const SubTitle = styled(Box)`
  font-weight: bold;
  font-size: 0.8em;
  text-align: center;
  padding: 10px;
`;

const ListItem = styled(Box)`
  width: 100%;
  display: flex;
`;

const PortLabel = styled(Box)`
  padding: 10px;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 150px;
  display: flex;
`;

const PortColor = styled(Box)`
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 8px;
  display: flex;
`;

const PortValue = styled(Box)`
  padding: 10px;
  display: flex;
`;

const PortInfo: React.FC<{
  port: PortStore;
  name: string;
  op: OpLifeCycle;
  value: any;
}> = observer(({ port, name, value, op }) => {
  let v;
  if (port.dataType === PortDataType.NUMBER) {
    v = (
      <Number
        value={value}
        onChange={(val) => {
          port.type === PortType.INPUT
            ? op.setInValue(name, val)
            : op.sendOutPortValue(name, value);
        }}
      />
    );
  } else if (port.dataType === PortDataType.STRING) {
    v = <Button>change</Button>;
  } else if (port.dataType === PortDataType.BOOL) {
    v = (
      <Checkbox
        checked={value}
        onChange={() => {
          port.type === PortType.INPUT
            ? op.setInValue(name, !value)
            : op.sendOutPortValue(name, value);
        }}
      />
    );
  } else if (port.dataType === PortDataType.TRIGGER) {
    v = (
      <Button
        onClick={() => {
          port.type === PortType.INPUT
            ? op.triggerIn(name)
            : op.triggerOut(name);
        }}
      >
        Trigger
      </Button>
    );
  } else if (port.dataType === PortDataType.OBJECT) {
    if (value === null) {
      v = 'null';
    } else if (value === undefined) {
      v = 'undefined';
    } else {
      v = Object.getPrototypeOf(value).constructor.name;
    }
  } else {
    v = JSON.stringify(value);
  }

  return (
    <ListItem>
      <PortColor style={{ backgroundColor: port.color }} />
      <PortLabel>{name}</PortLabel>
      <PortValue>{v}</PortValue>
    </ListItem>
  );
});

export const NodeInfo: React.FC<{ node: OpNodeStore }> = observer(
  ({ node }) => {
    const inputPorts = node.op.inputs.map(([portName, port]) => {
      return (
        <PortInfo
          key={port.id}
          port={port}
          name={portName}
          value={node.op.state[portName]}
          op={node.op}
        />
      );
    });

    const outputPorts = node.op.outputs.map(([portName, port]) => {
      return (
        <PortInfo
          key={port.id}
          port={port}
          name={portName}
          value={node.op.outputState[portName]}
          op={node.op}
        />
      );
    });

    return (
      <>
        <Box>
          <Title>{node.label}</Title>
          <SubTitle>INPUTS</SubTitle>
          {inputPorts}
          <SubTitle>OUTPUTS</SubTitle>
          {outputPorts}
          <Separator />
        </Box>
      </>
    );
  },
);

export const Panel: React.FC<{ viewState: ViewStateStore }> = observer(
  ({ viewState }) => {
    const nodes: React.ReactElement[] = [];

    viewState.selectedNodes.forEach((node) => {
      if (node instanceof OpNodeStore) {
        nodes.push(<NodeInfo key={node.id} node={node} />);
      }
    });

    return (
      <Box
        style={{
          overflowX: 'auto',
        }}
      >
        <ListItem>
          <PortColor style={{ backgroundColor: 'white' }} />
          <PortLabel>Selected nodes</PortLabel>
          <PortValue>{viewState.selectedNodes.size}</PortValue>
        </ListItem>
        {nodes}
      </Box>
    );
  },
);
