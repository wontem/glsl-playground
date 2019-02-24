import * as React from 'react';
import { styled, createGlobalStyle } from 'reakit';
import 'reset-css';

import Editor from '../containers/Editor';
import View from '../containers/View';
import { TabsPanel } from './TabsPanel';

const GlobalStyle = createGlobalStyle`
  html, body, #root {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
    font-family: "Fira Code", Menlo, Monaco, "Courier New", monospace;
  }
`;

const Panel = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
`;

const Column = styled.div`
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
  border-left: 1px solid #00000030;
`;

export class App extends React.Component {
  render() {
    return (
      <>
      <GlobalStyle/>
      <Panel>
        <LeftColumn>
          <Editor />
        </LeftColumn>
        <RightColumn>
          <View />
          <TabsPanel />
        </RightColumn>
      </Panel>
      </>
    );
  }
}
