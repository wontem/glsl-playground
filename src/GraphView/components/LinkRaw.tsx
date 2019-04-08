import * as React from 'react';
import { WIRE_WIDTH } from '../constants';

interface LinkRawProps {
  fromPoint: [number, number];
  toPoint: [number, number];
  color: string;
  // zTranslate?: number;

  width?: number;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  ignorePointerEvents?: boolean;
}

export const LinkRaw: React.FC<LinkRawProps> = ({
  fromPoint,
  toPoint,
  color,
  // zTranslate,
  width = WIRE_WIDTH,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  ignorePointerEvents,
}) => {
  // const isToUnderFrom = fromPoint[1] < toPoint[1];
  const dX = Math.min(Math.abs(toPoint[0] - fromPoint[0]), 50);
  const dY = Math.max(Math.abs(toPoint[1] - fromPoint[1]) / 2, dX);
  const d = [
    'M',
    fromPoint[0], fromPoint[1],
    'C',
    fromPoint[0], fromPoint[1] + dY,
    toPoint[0], toPoint[1] - dY,
    toPoint[0], toPoint[1],
  ].join(' ');

  return (
    <path
      d={d}
      stroke={color}
      fill="transparent"
      strokeWidth={width}
      strokeLinecap="round"
      pointerEvents={ignorePointerEvents ? 'none' : 'stroke'}
      // strokeDasharray='50% 10'
      // strokeDashoffset={}
      // z={zTranslate || 0 + 1}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
    />
  );
}
