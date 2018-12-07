import { MdClear, MdAdd, MdRadioButtonChecked, MdRadioButtonUnchecked } from 'react-icons/md';
import * as React from 'react';
import styled from 'styled-components';
import classnames from 'classnames';

import * as ActionCreators from '../actions/canvasView';
import { StyledIcon } from './Icon';
import { Props } from './BuffersList.models';

interface BuffersListItemProps {
  isOutputBuffer: boolean;
  isSelected: boolean;
  bufferName: string;
  selectBuffer: typeof ActionCreators.selectBuffer;
  setOutputBuffer: typeof ActionCreators.setOutputBuffer;
  removeBuffer: (name: string) => void;
  className?: string;
}

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const Name = styled.div`
  font-size: 14px;
  margin: 0 24px;
  flex-grow: 1;
  line-height: 24px;
  cursor: pointer;
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
      <li className={classnames({
        [this.props.className]: true,
        selected: this.props.isSelected,
        output: this.props.isOutputBuffer,
      })}>
        <StyledIcon className='icon_output' color='#00a6ff' isActive={true} onClick={this.setOutput}>{
          this.props.isOutputBuffer ? <MdRadioButtonChecked /> : <MdRadioButtonUnchecked />
        }</StyledIcon>
        <Name onClick={this.select}>{this.props.bufferName}</Name>
        <StyledIcon className='icon_delete' color='#FF5722' isActive={true} onClick={this.remove}><MdClear /></StyledIcon>
      </li>
    );
  }
}

const PlusBlock = styled.div`
  display: flex;
  justify-content: center;
  flex-shrink: 0;
`;

const ListItem = styled(BuffersListItem)`
  display: flex;
  padding: 4px 24px;

  &.selected {
    font-weight: bold;
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

class Order extends React.Component<{ items: string[], outputBuffer: string }> {
  render() {
    // const lastOutputBufferIndex = this.props.items.lastIndexOf(this.props.outputBuffer);

    const items = this.props.items.map((item, index) => {
      return (
        <li key={index}>{item}</li>
      )
    });

    return (
      <OrderList>
        {items}
      </OrderList>
    );
  }
}

export class BuffersList extends React.Component<Props> {
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
          <StyledIcon isActive={true} color='#008000' onClick={this.props.createBuffer}><MdAdd /></StyledIcon>
        </PlusBlock>
        <ChannelsList>
          {listItems}
        </ChannelsList>
        <Order
          outputBuffer={this.props.outputBuffer}
          items={this.props.buffersOrder}
        />
      </Panel>
    );
  }
}
