import { observer } from 'mobx-react-lite';
import * as monaco from 'monaco-editor';
import * as React from 'react';
import { OpGLProgram } from '../../GraphView/operator/OpGLProgram';
import { OpNodeStore } from '../../GraphView/stores/OpNodeStore';
import { ViewStateStore } from '../../GraphView/stores/ViewStateStore';
import { parseLogs } from '../../View/utils/parseLogs';
import { createContextState } from '../utils/createContextState';
import { Editor } from './Editor';
import { Item } from './Editor.models';

interface EditorState {
  isVisible: boolean;
  nodeId: string | null;
  portName: string | null;
  // items: Item[];
}

export const { context, Provider } = createContextState<EditorState>({
  isVisible: false,
  nodeId: null,
  portName: null,
  // items: [],
});

export const EditorContainer: React.FC<{
  viewState: ViewStateStore;
}> = observer(({ viewState }) => {
  const [editorState, setEditorState] = React.useContext(context);

  const { portName, nodeId } = editorState;

  let items: Item[] = [];
  let node: OpNodeStore;

  if (
    nodeId !== null &&
    portName !== null &&
    viewState.graph.nodes.has(nodeId)
  ) {
    node = viewState.graph.nodes.get(nodeId) as OpNodeStore;

    if (node && node.op.state.hasOwnProperty(portName)) {
      const markers: monaco.editor.IMarkerData[] = [];

      if (node.op instanceof OpGLProgram) {
        node.op.errors.forEach((viewEvent) => {
          if (viewEvent.message) {
            const logs = parseLogs(viewEvent.message);

            logs.forEach((log) => {
              const marker = {
                severity: monaco.MarkerSeverity.Error,
                message: `${log.item}: ${log.message}`,
                startLineNumber: log.line,
                endLineNumber: log.line,
                startColumn: 0,
                endColumn: Infinity,
              };

              markers.push(marker);
            });
          }
        });
      }

      items = [
        {
          markers,
          source: node.op.state[portName],
          name: portName,
          isActive: true,
        },
      ];
    }
  }

  return editorState.isVisible ? (
    <Editor
      items={items}
      projectName={nodeId || ''}
      onChange={(name, value) => {
        node && portName && node.op.setInValue(portName, value);
      }}
    />
  ) : null;
});
