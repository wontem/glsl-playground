import * as monaco from 'monaco-editor';
import * as React from 'react';
import styled from 'styled-components';
import { language } from '../glsl.language';
import { Props, State } from './Editor.models';
import { Editor as MonacoEditor, Model as MonacoModel } from './Monaco';

const Container = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
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
            theme: 'vs-dark',
          }}
        >
          {this.props.items.map(({ name, source, markers, isActive }) => (
            <MonacoModel
              key={`${this.props.projectName}/${name}`}
              initialValue={source}
              onChange={(value) => this.props.onChange(name, value)}
              isActive={isActive}
              markers={markers}
              language="glsl"
            />
          ))}
        </MonacoEditor>
      </Container>
    );
  }
}
