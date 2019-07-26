import * as React from 'react';
import { MdFiberManualRecord } from 'react-icons/md';
import { GLContext } from '../../GLContext';
import { saveFile } from '../utils/saveFile';
import { StyledIcon } from './Icon';

export const Recorder: React.FC<{ projectName: string }> = ({
  projectName,
}) => {
  const [isRecording, setIsRecording] = React.useState<boolean>(false);
  const [recorder, setRecorder] = React.useState<MediaRecorder>();
  const [gl] = React.useContext(GLContext);

  React.useEffect(() => {
    if (gl && gl.canvas) {
      const recorder = new MediaRecorder((gl.canvas as any).captureStream(), {
        mimeType: 'video/webm;codecs=vp9',
        // videoBitsPerSecond: 2500000 * 8,
      });
      setRecorder(recorder);
    }
  }, [gl]);

  React.useEffect(() => {
    if (recorder) {
      recorder.ondataavailable = (event) => {
        saveFile(event.data, `${projectName}_${Date.now()}.webm`);
      };
    }
  }, [recorder, projectName]);

  return (
    <StyledIcon
      isActive={isRecording}
      color="red"
      onClick={() => {
        if (recorder) {
          if (isRecording) {
            recorder.stop();
          } else {
            recorder.start();
          }

          setIsRecording(!isRecording);
        }
      }}
    >
      <MdFiberManualRecord />
    </StyledIcon>
  );
};
