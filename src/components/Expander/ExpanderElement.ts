import { Component } from '@/components/core';
import { DefaultState } from '@t/components';
import ExpanderView from './ExpanderView';
import { StoreGroupItem } from '@t/instance/source';
import { cn } from '@/healpers/className';
import { create$ } from '@/utils/dom';
import { Evt } from '@t/html';

export type ExpanderState = DefaultState & {
  data: StoreGroupItem;
};

export default class ExpanderElement extends Component<ExpanderView, ExpanderState> {
  init(): void {
    this.view.$target.classList.add('hui-grid-group-toggle');
    this._bindToggleEvent();
    this.view.setIcon(this.state.data.expanded);
  }

  /**
   * @private
   */
  private _bindToggleEvent() {
    const { data, instance } = this.state;
    const { store } = instance.source;
    this.view.on('click', (event) => {
      const isExpand = !event.currentTarget.querySelector('i')?.className.includes('arrow-down');
      data.expanded = isExpand;
      this.view.setIcon(isExpand);
      this._animationToggle(isExpand, () => store.publish());
    });
  }

  /**
   * @private
   * @param {boolean} isExpand
   * @param {Function} cb
   */
  private _animationToggle(isExpand: boolean, cb: Function) {
    const $row = this.view.$target.closest<HTMLElement>(cn('.', 'row'));
    if (!$row) return;

    const { data, instance } = this.state;
    const { demension, source, viewport } = instance;
    const currentKey = JSON.stringify(data.keys);
    const renderDatas = source.renderStore();

    let listener: any;
    if (!isExpand) cb(), (listener = (event: Evt<HTMLElement, 'animationend'>) => event.currentTarget.remove());
    else listener = (event: Evt<HTMLElement, 'animationend'>) => (cb(), event.currentTarget.remove());

    let startRowIndex = -1;
    const find = renderDatas.find((item) => {
      if (item.type !== 'group') return;
      if (startRowIndex === -1) {
        if (JSON.stringify(item.keys) === currentKey) startRowIndex = item.rowindex;
      } else {
        if (item.groupIndex <= data.groupIndex) return true;
      }
    });

    const count = (find ? find.rowindex - 1 : (renderDatas.at(-1)?.rowindex as number)) - startRowIndex;
    const { rowHeight } = demension();
    const viewportHeight = viewport().height;
    const $tempRow = create$('tr', { classList: ['hui-grid-animation-row'], ariaAttr: { expanded: isExpand } });
    $tempRow.addEventListener('animationend', listener);
    $tempRow.style.setProperty('--row-animation-height', `${Math.min(rowHeight * count, viewportHeight)}px`);
    $row.insertAdjacentElement('afterend', $tempRow);
  }
}
