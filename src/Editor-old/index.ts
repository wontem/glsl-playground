// import * as codemirror from 'codemirror';
// import 'codemirror/lib/codemirror.css';
// import 'codemirror/mode/clike/clike';
// import 'codemirror/keymap/sublime';

// import { View } from '../View';
// import frag from './fragment.glsl';
// import i from './k.jpg';
// import o from './o.jpg';
// import './style.css';
// import { ViewEvent } from '../View/models';
// import { parseLogs } from '../View/utils/parseLogs';

// const canvas = document.createElement('canvas');
// document.body.appendChild(canvas);

// const cm = codemirror(document.body, {
//   mode: 'x-shader/x-fragment',
//   value: frag,
//   lineNumbers: true,
//   keyMap: 'sublime',
//   viewportMargin: Infinity,
// });

// cm.on('change', (cm) => {
//   clearWidgets();
//   v.updateBuffer('channel0', cm.getValue());
//   startTime = performance.now();
//   currentFrame = 0;
// });

// const v = new View(canvas.getContext('webgl2') as WebGL2RenderingContext);
// // v.resize(0, 0);
// let cmWidgets: codemirror.LineWidget[] = [];

// interface Log {
//   fullMessage: string;
//   level: string;
//   file: string;
//   item: string;
//   message: string;
//   line: number;
// }

// function clearWidgets() {
//   cm.operation(() => {
//     cmWidgets.forEach(widget => widget.clear());
//   });

//   cmWidgets = [];
// }

// function setWidgets(logs: Log[]) {
//   clearWidgets();

//   logs.forEach((log) => {
//     const msg = document.createElement('div');
//     msg.appendChild(document.createTextNode(`${log.item} : ${log.message}`));
//     msg.className = 'compile-error';
//     cmWidgets.push(cm.addLineWidget(log.line - 1, msg, { coverGutter: false, noHScroll: true }));
//   });
// }

// v.on('error', (event: ViewEvent) => {
//   const parsedLogs = parseLogs(event.message);

//   console.log(parsedLogs);

//   setWidgets(parsedLogs);
// });

// v.createTexture('u_image');
// v.createBuffer('channel0', frag);
// v.setBuffersOrder(['channel0']);
// v.setBufferToOutput('channel0');

// const ii = new Image();
// ii.onload = () => {
//   v.updateTexture('u_image', {
//     source: ii,
//     flipY: true,
//   });

//   // const ratio = devicePixelRatio;
//   const ratio = 1; // devicePixelRatio;
//   v.resize(ii.width * ratio, ii.height * ratio);
//   canvas.style.width = `${Math.floor(canvas.width / ratio)}px`;
//   canvas.style.height = `${Math.floor(canvas.height / ratio)}px`;
// };

// ii.src = i;

// // setTimeout(
// //   () => {
// //     ii.src = o;
// //   },
// //   4000,
// // );

// let currentFrame = 0;
// let startTime = null;
// requestAnimationFrame(function frame() {
//   if (startTime === null) {
//     startTime = performance.now();
//   }

//   v.render(
//     [
//       {
//         name: 'u_time',
//         method: '1f',
//         value: [(performance.now() - startTime) / 1000],
//       },
//       {
//         name: 'u_frame',
//         method: '1f',
//         value: [currentFrame],
//       },
//       {
//         name: 'u_resolution',
//         method: '2f',
//         value: [canvas.width, canvas.height],
//       },
//     ],
//   );
//   currentFrame += 1;
//   requestAnimationFrame(frame);
// });

// (window as any).v = v;
