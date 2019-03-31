import * as React from 'react';
import { observer } from 'mobx-react';

import { LinkStore } from '../stores/LinkStore';
import { LinkRaw } from './LinkRaw';

@observer
export class Link extends React.Component<{
  link: LinkStore;
  isDisabled: boolean;
}, never> {
  render() {
    const { link, isDisabled } = this.props;

    return (
      <LinkRaw
        fromPoint={[link.from.x, link.from.y]}
        toPoint={[link.to.x, link.to.y]}
        color={isDisabled ? '#333' : link.from.color}
      />
    );
  }
}
