import * as React from 'react';

type ContextState<S> = [S, (newState: S) => void];

function createContextStateProvider<S>(
  context: React.Context<ContextState<S>>,
  initialState: S,
): React.FC {
  return ({ children }) => {
    const state = React.useState(initialState);

    return <context.Provider value={state}>{children}</context.Provider>;
  };
}

export function createContextState<S>(
  initialState: S,
): {
  context: React.Context<ContextState<S>>;
  Provider: React.FC;
} {
  const context = React.createContext<ContextState<S>>([
    initialState,
    () => {},
  ]);

  return {
    context,
    Provider: createContextStateProvider(context, initialState),
  };
}
