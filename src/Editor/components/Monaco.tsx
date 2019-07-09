import * as monaco from 'monaco-editor';
import * as React from 'react';

const MonacoContext: React.Context<monaco.editor.IStandaloneCodeEditor | null> = React.createContext<monaco.editor.IStandaloneCodeEditor | null>(
  null,
);

interface EditorProps {
  children?: React.ReactElement | React.ReactElement[];
  options?: monaco.editor.IEditorConstructionOptions;
}

export const Editor: React.FC<EditorProps> = ({ children, options }) => {
  const container: React.Ref<HTMLDivElement> = React.useRef(null);
  const [editor, setEditor] = React.useState<monaco.editor.IStandaloneCodeEditor>();

  React.useEffect(() => {
    if (container.current) {
      const editor = monaco.editor.create(container.current, options);
      setEditor(editor);
      return () => editor.dispose();
    }
  }, []);

  React.useEffect(() => {
    if (editor && options) {
      editor.updateOptions(options);
    }
  }, [options]);

  return (
    <>
      <div ref={container} style={{ height: '100%', width: '100%' }} />
      {editor ? (
        <MonacoContext.Provider value={editor}>
          {children}
        </MonacoContext.Provider>
      ) : null}
    </>
  );
};

interface ModelProps {
  initialValue: string;
  isActive: boolean;
  language?: string;
  uri?: monaco.Uri;
  markers?: monaco.editor.IMarkerData[];
  onChange: (value: string) => void;
}

export const Model: React.FC<ModelProps> = ({
  uri,
  initialValue: value,
  isActive,
  onChange,
  language,
  markers,
}) => {
  const [model, setModel] = React.useState<monaco.editor.ITextModel>();
  const [viewState, setViewState] = React.useState<monaco.editor.ICodeEditorViewState | null>(null);
  const editor: monaco.editor.IStandaloneCodeEditor | null = React.useContext(
    MonacoContext,
  );
  const actualMarkers: monaco.editor.IMarkerData[] = markers || [];

  React.useEffect(() => {
    const model = monaco.editor.createModel(value, language, uri);

    setModel(model);

    const subscription = model.onDidChangeContent(() => {
      onChange(model.getValue());
    });

    return () => {
      subscription.dispose();
      model.dispose();
    };
  }, []);

  React.useEffect(() => {
    if (editor && model && isActive) {
      editor.setModel(model);
    }
  });

  React.useLayoutEffect(() => {
    if (editor && model && !isActive) {
      setViewState(editor.saveViewState());
    }
  }, [editor, model, isActive]);

  React.useEffect(() => {
    if (editor && model && isActive && viewState) {
      editor.restoreViewState(viewState);
    }
  }, [editor, model, isActive]);

  React.useEffect(() => {
    if (model && language) {
      monaco.editor.setModelLanguage(model, language);
    }
  }, [model, language]);

  React.useEffect(() => {
    if (model) {
      monaco.editor.setModelMarkers(model, 'markers', actualMarkers);
    }
  }, [model, actualMarkers]);

  return null;
};
