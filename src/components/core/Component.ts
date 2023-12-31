import { DefaultState } from '@t/components/index.d';
import { View } from '@/components/core';

export default class Component<V extends View, State extends DefaultState> {
  state: State;
  view: V;
  constructor(view: V, state: State) {
    this.view = view;
    this.state = state;
    this.view.render();
    this.init();
  }

  init() {}
}
