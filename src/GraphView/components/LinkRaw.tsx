import * as React from 'react';

interface LinkRawProps {
  fromPoint: [number, number];
  toPoint: [number, number];
  color: string;
}

export const LinkRaw: React.FC<LinkRawProps> = ({
  fromPoint,
  toPoint,
  color,
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
      strokeWidth={2}
      strokeLinecap="round"
    />
  );
}
