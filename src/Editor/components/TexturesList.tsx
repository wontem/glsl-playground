import { MdClear, MdAdd } from 'react-icons/md';
import * as React from 'react';
import { styled, Input } from 'reakit';

import { StyledIcon } from './Icon';
import { Props, State } from './TexturesList.models';
import { TextureState } from '../reducers/canvasView';
import { Filter, Wrap } from '../../View/models';

interface TexturesListItemProps {
  textureName: string;
  textureState: TextureState;
  updateTexture: (name: string, textureState: TextureState) => void;
  removeTexture: (name: string) => void;
  className?: string;
}

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const Name = styled.div`
  flex-grow: 1;
  margin: 0 24px;
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
        <Input
          use='select'
          value={this.props.textureState.filter}
          onChange={(event: any) => {
            this.props.updateTexture(this.props.textureName, {
              ...this.props.textureState,
              filter: parseInt(event.target.value, 10),
            });
          }}
        >
          <option value={Filter.LINEAR}>Linear</option>
          <option value={Filter.NEAREST}>Nearest</option>
          <option value={Filter.MIPMAP}>Mipmap</option>
          <option value={Filter.BLUR}>Blur</option>
        </Input>
        <Input
          use='select'
          value={this.props.textureState.wrap[0]}
          onChange={(event: any) => {
            this.props.updateTexture(this.props.textureName, {
              ...this.props.textureState,
              wrap: [parseInt(event.target.value, 10), this.props.textureState.wrap[1]],
            });
          }}
        >
          <option value={Wrap.CLAMP}>Clamp</option>
          <option value={Wrap.REPEAT}>Repeat</option>
          <option value={Wrap.MIRROR}>Mirror</option>
        </Input>
        <Input
          use='select'
          value={this.props.textureState.wrap[1]}
          onChange={(event: any) => {
            this.props.updateTexture(this.props.textureName, {
              ...this.props.textureState,
              wrap: [this.props.textureState.wrap[0], parseInt(event.target.value, 10)],
            });
          }}
        >
          <option value={Wrap.CLAMP}>Clamp</option>
          <option value={Wrap.REPEAT}>Repeat</option>
          <option value={Wrap.MIRROR}>Mirror</option>
        </Input>
        <StyledIcon className='icon_delete' color='#FF5722' isActive={true} onClick={this.remove}><MdClear /></StyledIcon>
      </li>
    );
  }
}

const PlusBlock = styled.div`
  display: flex;
  padding: 4px 24px;
  justify-content: center;
  flex-shrink: 0;
`;

const ListItem = styled(TexturesListItem)`
  display: flex;
  padding: 4px 24px;
  line-height: 24px;
  font-size: 14px;

  &.selected {
    font-weight: bold;
  }
`;

const List = styled.ul`
  flex-grow: 1;
  overflow: hidden;
  overflow-y: auto;
`;

const LinkInput = styled(Input)`
  flex-grow: 1;
  font-size: 14px;
  margin: 0 24px;
  line-height: 24px;
  background: rgba(0, 0, 0, 0.1);
  padding: 0 8px;
  border-radius: 4px;
  outline: none;
`;

export class TexturesList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      addInput: '',
    };
  }

  render() {
    const listItems = this.props.textureNames.map((textureName) => {
      return (
        <ListItem
          key={textureName}
          textureName={textureName}
          textureState={this.props.textures[textureName]}
          removeTexture={this.props.removeTexture}
          updateTexture={this.props.updateTexture}
        />
      );
    });

    return (
      <Panel>
        <PlusBlock>
          <LinkInput
            value={this.state.addInput}
            onChange={(event: any) => {
              this.setState({
                addInput: event.target.value,
              });
            }}
          />
          <StyledIcon isActive={true} color='#008000' onClick={() => {
            this.props.createTexture(this.state.addInput);
            this.setState({
              addInput: '',
            });
          }}><MdAdd /></StyledIcon>
        </PlusBlock>
        <List>
          {listItems}
        </List>
      </Panel>
    );
  }
}
