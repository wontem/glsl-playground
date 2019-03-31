import * as React from "react";
import { withHotKeys, HotKeysProps } from "react-hotkeys";

type HotKeysWrapperProps = {
  hotKeys?: object;
  style?: React.CSSProperties;
} & HotKeysProps;

class HotKeysWrapper extends React.Component<HotKeysWrapperProps> {
  render() {
    const { children, hotKeys, style } = this.props;

    return (
      <div {...hotKeys} style={style}>
        {children}
      </div>
    );
  }
}

export const HotKeys: React.ComponentClass<HotKeysWrapperProps> = withHotKeys(HotKeysWrapper, {}) as any;
