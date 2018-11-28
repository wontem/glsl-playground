import * as React from 'react';
import styled from 'styled-components';

const UnstyledPoint: React.SFC<{
  color?: string;
  onClick?: () => any;
  isActive?: boolean;
  className?: string;
}> = (props) => (
  <div
    className={props.className}
    onClick={props.onClick}
  />
);

export const Point = styled(UnstyledPoint).attrs(props => ({
  isActive: 'isActive' in props ? props.isActive : true,
  color: props.color || 'grey',
}))`
  width: 16px;
  height: 16px;
  border-radius: 100%;
  margin: 8px;
  flex-grow: 0;
  flex-shrink: 0;
  opacity: .5;
  cursor: pointer;
  box-sizing: border-box;

  background: ${props => props.isActive ? props.color : 'transparent'};
  border: ${props => props.isActive ? 'none' : `1px solid ${props.color}`};
`;
