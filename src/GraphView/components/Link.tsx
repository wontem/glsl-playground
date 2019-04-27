import * as React from 'react';
import { observer } from 'mobx-react';

import { LinkStore } from '../stores/LinkStore';
import { LinkRaw } from './LinkRaw';
import { PORT_WIDTH, WIRE_WIDTH } from '../constants';

@observer
export class Link extends React.Component<{
  link: LinkStore;
  isHighlighted: boolean;
  onMouseEnter: (e: React.MouseEvent, item: any) => void;
  onMouseLeave: (e: React.MouseEvent, item: any) => void;
  onMouseDown: (e: React.MouseEvent, item: any) => void;
  isHovered?: boolean;
}, never> {
  render() {
    const { link, isHighlighted, isHovered } = this.props;

    return (
      <>
        <LinkRaw
          fromPoint={[link.in.x, link.in.y]}
          toPoint={[link.out.x, link.out.y]}
          color='transparent'
          width={WIRE_WIDTH * 2}
          onMouseEnter={(e) => this.props.onMouseEnter(e, link)}
          onMouseLeave={(e) => this.props.onMouseLeave(e, link)}
          onMouseDown={(e) => this.props.onMouseDown(e, link)}
        />
        <LinkRaw
          fromPoint={[link.in.x, link.in.y]}
          toPoint={[link.out.x, link.out.y]}
          color={isHighlighted ? link.in.color : '#263238'}
          width={isHovered ? WIRE_WIDTH * 2 : WIRE_WIDTH}
          ignorePointerEvents
        />
      </>
    );
  }
}
