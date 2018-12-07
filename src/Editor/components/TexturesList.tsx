import { MdClear, MdAdd } from 'react-icons/md';
import * as React from 'react';
import styled from 'styled-components';

import { StyledIcon } from './Icon';
import { Props } from './TexturesList.models';

interface TexturesListItemProps {
  textureName: string;
  removeTexture: (name: string) => void;
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

class TexturesListItem extends React.Component<TexturesListItemProps> {
  remove = () => {
    this.props.removeTexture(this.props.textureName);
  }

  render() {
    return (
      <li className={this.props.className}>
        <Name>{this.props.textureName}</Name>
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

const ListItem = styled(TexturesListItem)`
  display: flex;
  padding: 4px 24px;

  &.selected {
    font-weight: bold;
  }
`;

const List = styled.ul`
  flex-grow: 1;
  overflow: hidden;
  overflow-y: auto;
`;

export class TexturesList extends React.Component<Props> {
  render() {
    const listItems = this.props.textureNames.map((textureName) => {
      return (
        <ListItem
          key={textureName}
          textureName={textureName}
          removeTexture={this.props.removeTexture}
        />
      );
    });

    return (
      <Panel>
        <PlusBlock>
          <StyledIcon isActive={true} color='#008000' onClick={this.props.createTexture}><MdAdd /></StyledIcon>
        </PlusBlock>
        <List>
          {listItems}
        </List>
      </Panel>
    );
  }
}
