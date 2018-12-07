import * as React from 'react';
import { styled, Block, Tabs } from 'reakit';

import BuffersList from '../containers/BuffersList';
import TexturesList from '../containers/TexturesList';

const Container = styled(Block)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const Panel = styled(Tabs.Panel)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const TabsList = styled(Tabs)`
  display: flex;
`;

const Tab = styled(Tabs.Tab)`
  padding: 8px 8px;
  flex-shrink: 0;
  flex-grow: 1;
  cursor: pointer;
  text-align: center;
  outline: none;

  &.active {
    font-weight: bold;
  }
`;

export const TabsPanel: React.SFC = () => (
  <Tabs.Container>
    {tabs => (
      <Container>
        <TabsList>
          <Tab {...tabs} tab='buffers'>Buffers</Tab>
          <Tab {...tabs} tab='textures'>Textures</Tab>
        </TabsList>
        <Panel {...tabs} tab='buffers'><BuffersList /></Panel>
        <Panel {...tabs} tab='textures'><TexturesList /></Panel>
      </Container>
    )}
  </Tabs.Container>
);
