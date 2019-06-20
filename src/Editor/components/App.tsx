import * as React from 'react';
import { Box, Provider } from 'reakit';
import * as system from 'reakit-system-bootstrap';
import 'reset-css';
import styled, { createGlobalStyle } from 'styled-components';
import { GLView } from '../../GLContext';
import { Patch } from '../../GraphView/components/Patch';
import { PortColors } from '../../GraphView/operator/constants';
import { Panel } from '../../GraphView/panelComponents/Panel';
import { GraphStore } from '../../GraphView/stores/GraphStore';
import { ViewStateStore } from '../../GraphView/stores/ViewStateStore';

const GlobalStyle = createGlobalStyle`
  html, body, #root {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
    font-family: Helvetica, sans-serif;
  }
`;

const Block = styled(Box)`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
`;

const Column = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const LeftColumn = styled(Column)`
  flex-grow: 1;
  position: relative;
  overflow: hidden;
`;

const RightColumn = styled(Column)`
  width: 400px;
  flex-grow: 0;
  flex-shrink: 0;
  position: relative;
  // border-left: 1px solid #00000030;
`;

// TODO: useContext
const graph = new GraphStore({
  colors: PortColors,
});
const viewState = new ViewStateStore(graph);

viewState.width = 1024;
viewState.height = 640;

export class App extends React.Component {
  render() {
    return (
      <Provider unstable_system={system}>
        <GlobalStyle />
        <Block>
          <LeftColumn>
            <Patch viewState={viewState} />
            {/* <Editor /> */}
          </LeftColumn>
          <RightColumn>
            <GLView />
            <Panel viewState={viewState} />

            {/* <View /> */}
            {/* <TabsPanel /> */}
          </RightColumn>
        </Block>
      </Provider>
    );
  }
}
