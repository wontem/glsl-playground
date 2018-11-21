import * as codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/clike/clike';
import 'codemirror/keymap/sublime';

import { View } from '../View';
import frag from './fragment.glsl';
import i from './k.jpg';
import './style.css';
import { ViewEvent } from '../View/models';

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
  const regexp = /^(\w+):\s(\d+):(\d+):\s'(.*?)'\s:\s(.*)$/mg;
  const matches = [];
  while (true) {
    const match = regexp.exec(event.message);
    if (match === null) {
      break;
    }
    matches.push(match);
  }

  const parsedLogs: {
    fullMessage: string,
    level: string,
    file: string,
    item: string,
    message: string,
    line: number,
  }[] = (matches as string[][]).map(([fullMessage, level, file, line, item, message]) => {
    return {
      fullMessage,
      level,
      file,
      item,
      message,
      line: parseInt(line, 10),
    };
  });

  setWidgets(parsedLogs);
});

v.createTexture('u_image');
v.load(frag);

const ii = new Image();
ii.onload = () => {
  v.updateTexture('u_image', {
    source: ii,
    flipY: true,
  });

  const ratio = 1; // devicePixelRatio;
  v.resize(ii.width * ratio, ii.height * ratio);
  canvas.style.width = `${Math.floor(canvas.width / ratio)}px`;
  canvas.style.height = `${Math.floor(canvas.height / ratio)}px`;
};
ii.src = i;

requestAnimationFrame(function frame() {
  v.render();

  requestAnimationFrame(frame);
});

(window as any).v = v;
