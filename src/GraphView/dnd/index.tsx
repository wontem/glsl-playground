import * as React from 'react';
import { observable } from 'mobx';
import * as ReactDOM from 'react-dom';

class DnDState {
  @observable isDragging: boolean = false;
}

// type DnDType = {}

const DragSource = <C extends React.ComponentClass>(
  type: string,
) => (ComponentClass: C): C => {
  return ComponentClass;
}

@DragSource('s')
class A extends React.Component {

}


const DragDropContext = <P extends {} = {}>() => (Component: React.ComponentType<P>): React.ComponentClass<P> => {
  return class DragDropContext extends React.Component<P, never> {
    private containerElement: React.Ref<typeof Component>;

    componentDidMount() {
      const node = ReactDOM.findDOMNode(this.);

    }

    componentWillUnmount() {

    }

    render() {
      return (
        <Component ref={} { ...this.props } />
      );
    }
  }
}
