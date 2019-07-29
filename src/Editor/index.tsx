import * as React from 'react';
import { render } from 'react-dom';
import { Wires } from '../Wires';

const root = document.body.appendChild(document.createElement('div'));

const wires = new Wires();

const test = (canvas: HTMLCanvasElement) => {
  wires.init(canvas);
};

const App: React.FC = () => {
  return (
    <>
      <canvas
        ref={(canvas) => {
          if (canvas) {
            test(canvas);
          }
        }}
        width={1024}
        height={1024}
        style={{
          width: 512,
          height: 512,
        }}
      />
      <input
        onChange={(event) => {
          if (!event.target.files) {
            return;
          }

          const reader = new FileReader();
          const file = event.target.files[0];

          reader.addEventListener('load', (event) => {
            wires.useProject((event.target as FileReader)
              .result as ArrayBuffer);
          });
          reader.readAsArrayBuffer(file);
        }}
        type="file"
        accept="application/json"
      />
    </>
  );
};

render(<App />, root);

// wires.activate();
