import * as React from 'react';
import { HotKeysProps, withHotKeys } from 'react-hotkeys';

type HotKeysWrapperProps = {
  hotKeys?: object;
  style?: React.CSSProperties;
} & HotKeysProps;

class HotKeysWrapper extends React.Component<HotKeysWrapperProps> {
  render() {
    const { children, hotKeys, style, innerRef } = this.props;

    return (
      <div
        {...hotKeys}
        ref={innerRef as React.RefObject<HTMLDivElement>}
        style={style}
      >
        {children}
      </div>
    );
  }
}

export const HotKeys: React.ComponentClass<HotKeysWrapperProps> = withHotKeys(
  HotKeysWrapper,
  {},
) as any;
