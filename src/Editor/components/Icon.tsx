import * as React from 'react';
import { styled } from 'reakit';

const Icon: React.SFC<{
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  color?: string;
  children?: any;
}> = (props) => (
  <div className={props.className} onClick={props.onClick}>
    {props.children}
  </div>
);

export const StyledIcon = styled(Icon)`
  opacity: 0.5;
  color: ${props => props.isActive && props.color || 'currentColor'};
  height: 1em;
  font-size: 24px;
  cursor: pointer;
  user-select: none;
  overflow: hidden;
  flex-shrink: 0;

  &:hover {
    opacity: 1;
  }
`;
