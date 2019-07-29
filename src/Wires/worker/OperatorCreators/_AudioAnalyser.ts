import { GLState } from '../../GLContext';
import { Filter } from '../../View/models';
import { Texture } from '../../View/Texture';
import { OpNodeStore } from '../stores/OpNodeStore';
import { PortDataType } from './constants';
import { OpLifeCycle } from './OpLifeCycle';

export class OpAudioAnalyser extends OpLifeCycle {
  name = 'OpAudioAnalyser';
  private glState: GLState;
  private audioCtx: AudioContext = new AudioContext(); // TODO: move into context
  private frequencies!: Uint8Array;
  private waveform!: Uint8Array;
  private analyser: AnalyserNode;
  private texture: Texture;

  constructor(node: OpNodeStore, glState: GLState) {
    super(node);

    this.glState = glState;
    this.analyser = this.audioCtx.createAnalyser();
    this.texture = new Texture(this.glState.gl);

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const source = this.audioCtx.createMediaStreamSource(stream);
      source.connect(this.analyser);
    });

    this.addInPort('fftSize', PortDataType.NUMBER, this.analyser.fftSize);
    this.addInPort(
      'smoothness',
      PortDataType.NUMBER,
      this.analyser.smoothingTimeConstant,
    );
    this.addSelectPort(
      'filter',
      [Filter.LINEAR, Filter.NEAREST],
      Filter.NEAREST,
    );

    this.addInTrigger('read', () => {
      this.renderTexture();
    });

    this.addOutPort('texture', PortDataType.OBJECT, this.texture);
    this.addOutPort(
      'size',
      PortDataType.NUMBER,
      this.analyser.frequencyBinCount,
    );
  }

  setFFTSize(fftSize: number) {
    try {
      this.analyser.fftSize = fftSize;
      const bufferLength = this.analyser.frequencyBinCount;
      this.frequencies = new Uint8Array(bufferLength);
      this.waveform = new Uint8Array(bufferLength);

      this.sendOutPortValue('size', bufferLength);
    } catch (error) {
      console.error(error);
    }
  }

  setSmoothness(smoothness: number) {
    try {
      this.analyser.smoothingTimeConstant = smoothness;
    } catch (error) {
      console.error(error);
    }
  }

  renderTexture() {
    const bufferLength = this.analyser.frequencyBinCount;
    this.analyser.getByteFrequencyData(this.frequencies);
    this.analyser.getByteTimeDomainData(this.waveform);
    const data = new Uint8Array(bufferLength * 4);

    for (let index = 0; index < bufferLength; index += 1) {
      const offset = index * 4;
      data[offset] = this.frequencies[index]; // TODO: maybe it's better to use GL_R8 texture here (for only one type of data)
      data[offset + 1] = this.waveform[index];
    }

    this.texture.setData(data, [bufferLength, 1]);

    this.sendOutPortValue('texture', this.texture);
  }

  opDidCreate() {
    this.setSmoothness(this.state.smoothness);
    this.setFFTSize(this.state.fftSize);
    this.texture.setFilter(this.state.filter);
  }

  opDidUpdate(prevState: any) {
    if (prevState.fftSize !== this.state.fftSize) {
      this.setFFTSize(this.state.fftSize);
      this.renderTexture();
    }

    if (prevState.filter !== this.state.filter) {
      this.texture.setFilter(this.state.filter);
    }

    if (prevState.smoothness !== this.state.smoothness) {
      this.setSmoothness(this.state.smoothness);
    }
  }

  opWillBeDestroyed() {
    this.audioCtx.close();
  }
}
