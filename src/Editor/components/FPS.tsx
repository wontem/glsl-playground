import * as React from 'react';
import { useFPS } from './useFPS';

export const FPS: React.FC = () => {
  const fps = useFPS();

  return <span>{fps}</span>;
};
