import * as React from 'react';
import { AnimationLoop } from '../utils/AnimationLoop';

export const useFPS = () => {
  const [fps, setFPS] = React.useState('');

  React.useEffect(() => {
    const animationLoop = new AnimationLoop();

    animationLoop.on('tick', () => {
      setFPS(animationLoop.getFPS().toFixed(0));
    });

    animationLoop.togglePlay(true);

    return () => {
      animationLoop.togglePlay(false);
      animationLoop.removeAllListeners();
    };
  }, []);

  return fps;
};
