import * as React from 'react';
import styled from 'styled-components';

import * as ActionCreators from '../actions/canvasView';

interface BuffersListProps {
  bufferNames: string[];
  outputBuffer: string;
  selectedBuffer: string;
  buffersOrder: string[];
  createBuffer: typeof ActionCreators.createBuffer;
  selectBuffer: typeof ActionCreators.selectBuffer;
  setOutputBuffer: typeof ActionCreators.setOutputBuffer;
  removeBuffer: typeof ActionCreators.removeBuffer;
}

interface BuffersListItemProps {
  isOutputBuffer: boolean;
  isSelected: boolean;
  bufferName: string;
  selectBuffer: typeof ActionCreators.selectBuffer;
  setOutputBuffer: typeof ActionCreators.setOutputBuffer;
  removeBuffer: typeof ActionCreators.removeBuffer;
  className?: string;
}

const Panel = styled.div`
  border-top: 1px solid #00000030;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const Name = styled.div`
  font-family: Helvetica, sans-serif;
  font-size: 14px;
  padding: 8px 16px;
  flex-grow: 1;
`;

class BuffersListItem extends React.Component<BuffersListItemProps> {
  select = () => {
    this.props.selectBuffer(this.props.bufferName);
  }

  remove = () => {
    this.props.removeBuffer(this.props.bufferName);
  }

  setOutput = () => {
    if (!this.props.isOutputBuffer) {
      this.props.setOutputBuffer(this.props.bufferName);
    }
  }

  render() {
    return (
      <li className={this.props.className}>
        <Name onClick={this.select}>{this.props.bufferName}</Name>
        <Output onClick={this.setOutput}></Output>
        <Minus onClick={this.remove}></Minus>
      </li>
    );
  }
}

const Point = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 100%;
  margin: 8px;
  background: grey;
  flex-grow: 0;
  flex-shrink: 0;
  opacity: .5;
  cursor: pointer;
  box-sizing: border-box;
`;

const Plus = styled(Point)`
  background: #008000;
`

const PlusBlock = styled.div`
  display: flex;
  justify-content: center;
  flex-shrink: 0;
`;

const Output = styled(Point)`
  background: #00a6ff;
`

const Minus = styled(Point)`
  background: #cc0000;
`

const ListItem = styled(BuffersListItem)`
  display: flex;
  background: ${props => props.isSelected ? 'hsla(210, 100%, 50%, .1)' : 'transparent'};

  & ${Output} {
    background: ${props => props.isOutputBuffer ? '#00a6ff' : 'transparent'};
    border: ${props => props.isOutputBuffer ? 'none' : '1px solid #00a6ff'};
  }

  &:hover ${Point} {
    opacity: 1;
  }
`;

const OrderList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  padding: 4px;
  flex-shrink: 0;
  max-height: 200px;
  overflow-y: auto;

  & > li {
    font-family: Helvetica, sans-serif;
    font-size: 14px;
    padding: 8px 16px;
    margin: 4px;
    border-radius: 4px;
    background: hsla(210, 100%, 50%, .1);
    color: #00a6ff;
  }
`

const ChannelsList = styled.ul`
  flex-grow: 1;
  overflow: hidden;
  overflow-y: auto;
`;

class Order extends React.Component<{ items: string[] }> {
  render() {
    const items = this.props.items.map((item) => {
      return (
        <li key={item}>{item}</li>
      )
    });

    return (
      <OrderList>
        {items}
      </OrderList>
    );
  }
}

export class BuffersList extends React.Component<BuffersListProps> {
  render() {
    const listItems = this.props.bufferNames.map((bufferName) => {
      return (
        <ListItem
          isOutputBuffer={this.props.outputBuffer === bufferName}
          isSelected={this.props.selectedBuffer === bufferName}
          key={bufferName}
          bufferName={bufferName}
          selectBuffer={this.props.selectBuffer}
          setOutputBuffer={this.props.setOutputBuffer}
          removeBuffer={this.props.removeBuffer}
        />
      );
    });

    return (
      <Panel>
        <PlusBlock>
          <Plus onClick={this.props.createBuffer}></Plus>
        </PlusBlock>
        <ChannelsList>
          {listItems}
        </ChannelsList>
        <Order
          items={this.props.buffersOrder}
        />
      </Panel>
    );
  }
}
