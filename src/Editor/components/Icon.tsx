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
  height: 24px;
  font-size: 24px;
  cursor: pointer;
  user-select: none;

  &:hover {
    opacity: 1;
  }
`;
