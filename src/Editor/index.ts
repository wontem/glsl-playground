import * as codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/clike/clike';
import 'codemirror/keymap/sublime';

import { View } from '../View';
import frag from './fragment.glsl';
import i from './k.jpg';
import o from './o.jpg';
import './style.css';
import { ViewEvent } from '../View/models';
import { parseLogs } from './utils/parseLogs';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

const cm = codemirror(document.body, {
  mode: 'x-shader/x-fragment',
  value: frag,
  lineNumbers: true,
  keyMap: 'sublime',
  viewportMargin: Infinity,
});

cm.on('change', (cm) => {
  clearWidgets();
  v.load(cm.getValue());
});

const v = new View(canvas.getContext('webgl2') as WebGL2RenderingContext);
// v.resize(0, 0);
let cmWidgets: codemirror.LineWidget[] = [];

interface Log {
  fullMessage: string;
  level: string;
  file: string;
  item: string;
  message: string;
  line: number;
}

function clearWidgets() {
  cm.operation(() => {
    cmWidgets.forEach(widget => widget.clear());
  });

  cmWidgets = [];
}

function setWidgets(logs: Log[]) {
  clearWidgets();

  logs.forEach((log) => {
    const msg = document.createElement('div');
    msg.appendChild(document.createTextNode(`${log.item} : ${log.message}`));
    msg.className = 'compile-error';
    cmWidgets.push(cm.addLineWidget(log.line - 1, msg, { coverGutter: false, noHScroll: true }));
  });
}

v.on('error', (event: ViewEvent) => {
  const parsedLogs = parseLogs(event.message);

  setWidgets(parsedLogs);
});

const texture = v.createTexture();
v.load(frag);

const ii = new Image();
ii.onload = () => {
  v.updateTexture(texture, {
    source: ii,
    flipY: true,
  });

  const ratio = devicePixelRatio;
  // const ratio = 1; // devicePixelRatio;
  v.resize(ii.width * ratio, ii.height * ratio);
  canvas.style.width = `${Math.floor(canvas.width / ratio)}px`;
  canvas.style.height = `${Math.floor(canvas.height / ratio)}px`;
};

ii.src = i;

// setTimeout(
//   () => {
//     ii.src = o;
//   },
//   4000,
// );

requestAnimationFrame(function frame() {
  v.render(
    [
      {
        name: 'u_time',
        method: '1f',
        value: [performance.now() / 1000],
      },
      {
        name: 'u_resolution',
        method: '2f',
        value: [canvas.width, canvas.height],
      },
    ],
    [
      ['u_image', texture],
    ],
  );

  requestAnimationFrame(frame);
});

(window as any).v = v;
