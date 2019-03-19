import * as React from 'react';
import * as monaco from 'monaco-editor';
import { styled } from 'reakit';

import { Editor as MonacoEditor, Model as MonacoModel } from './Monaco';
import { Props, State } from './Editor.models';
import { language } from '../glsl.language';

const Container = styled.div`
  height: 0;
  flex-grow: 1;
`;

export class Editor extends React.Component<Props, State> {
  componentWillMount() {
    monaco.languages.register({
      id: 'glsl',
    });

    monaco.languages.setMonarchTokensProvider('glsl', language);
  }

  render() {
    return (
        <Container>
          <MonacoEditor
            options={{
              automaticLayout: true,
              fontFamily: '"Fira Code", Menlo, Monaco, "Courier New", monospace',
              scrollBeyondLastLine: false,
              readOnly: this.props.items.length === 0,
            }}
          >
          {this.props.items.map(({ name, source, markers, isActive }) => (
            <MonacoModel
              key={`${this.props.projectName}/${name}`}
              initialValue={source}
              onChange={(value) => this.props.onChange(name, value)}
              isActive={isActive}
              markers={markers}
              language='glsl'
            />
          ))}
          </MonacoEditor>
        </Container>
    );
  }
}
