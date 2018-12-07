declare module '*.glsl' {
  const content: string;
  export default content;
}

declare module '*.tmLanguage' {
  const content: string;
  export default content;
}

declare module '*.wasm' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: any;
  export default content;
}

declare module '*.worker' {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}
