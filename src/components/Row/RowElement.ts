import { Component } from '@/components/core';
import RowView from './RowView';
import { DefaultState } from '@t/components';
import { create$ } from '@/utils/dom';
import { ColumnElement, ColumnView } from '@/components/Column';
import { CellElement, CellView } from '@/components/Cell';
import { SourceData, StoreDataItem, StoreGroupItem } from '@t/instance/source';
import { ExpanderElement, ExpanderView } from '@/components/Expander';
import { cn } from '@/healpers/className';
import { isEqual } from 'lodash-es';

export type RowType = 'header' | 'virtual' | 'group' | 'data';

export type RowState = DefaultState & (DataRowState | HeaderRowState | VirtualRowState);

export type DataRowState<Data extends SourceData = SourceData> = Data extends StoreGroupItem
  ? {
      type: 'group';
      data: StoreGroupItem;
    }
  : {
      type: 'data';
      data: StoreDataItem;
    };

export type HeaderRowState = {
  type: 'header';
  rowindex: number;
};

export type VirtualRowState = {
  type: 'virtual';
  height: number;
};

export default class RowElement extends Component<RowView, RowState> {
  Cells?: CellElement[];
  Columns?: ColumnElement[];

  get type() {
    return this.state.type;
  }

  init(): void {
    this.view.setRowType(this.state.type);
    // Set rowHeight
    if (this.state.type !== 'virtual') this.view.style({ height: this.state.instance.demension().rowHeight + 'px' });
    // Render columns
    this._renderColumnHeaders();
    this._renderDataCells();
    this._renderVirtualCells();
    this._renderGroupCells();
  }

  /**
   * @private
   */
  private _renderVirtualCells() {
    if (this.state.type !== 'virtual') return;
    const { height, instance } = this.state;
    const { length } = instance.column.visibleColumnInfos;
    const tds = Array.from({ length }, (_) => `<td style="height: ${height}px"></td>`).join('');
    this.view.$target.innerHTML = tds;
  }

  /**
   * @private
   */
  private _renderColumnHeaders() {
    const { type } = this.state;
    const { $target } = this.view;
    if (type !== 'header') return;
    const { instance, rowindex } = this.state;
    const { column } = instance;
    const { headerRowCount, indexColumnHeaderInfoMap, groupColumnInfos } = column;
    instance.column.columnHeaderInfos;
    const visibleColumnHeaderInfos = indexColumnHeaderInfoMap[rowindex].filter(({ visible }) => visible);

    $target.innerHTML = '';

    if (rowindex === 1 && groupColumnInfos.length !== 0) {
      // Add group space
      groupColumnInfos.forEach(({ groupIndex }) => {
        const $td = create$('td', {
          role: 'columnheader',
          className: cn('expander'),
          attr: { groupindex: groupIndex, rowspan: headerRowCount },
        });
        $target.appendChild($td);
      });
    }

    this.Columns = visibleColumnHeaderInfos.map((columnHeaderInfo) => {
      const { colindex } = columnHeaderInfo;
      const $td = create$('td', { role: 'columnheader', ariaAttr: { colindex } });
      $target.appendChild($td);
      return new ColumnElement(new ColumnView($td), { columnHeaderInfo, instance });
    });
  }

  /**
   * @private
   */
  private _renderDataCells() {
    const { instance, type } = this.state;
    const { $target } = this.view;
    if (type !== 'data') return;
    const { data } = this.state;

    // Set even row background
    // @ts-ignore
    const dataindex = Number(data.dataindex ?? -1);
    if (dataindex > -1 && dataindex % 2 === 1) $target.classList.add('row-alt');

    const { column } = instance;
    const { visibleColumnInfos, groupColumnInfos } = column;

    $target.innerHTML = '';

    // Render group cells
    groupColumnInfos.forEach(() => {
      const $td = create$('td', { role: 'gridcell', className: cn('expander') });
      $target.appendChild($td);
    });

    this.Cells = visibleColumnInfos.map((columnInfo) => {
      const { colindex } = columnInfo;
      const $td = create$('td', { role: 'gridcell', ariaAttr: { colindex } });
      $target.appendChild($td);
      return new CellElement(new CellView($td), { type: 'data', columnInfo, instance, data });
    });

    this._renderEditCell();
  }

  /**
   * @private
   */
  private _renderEditCell() {
    const { edit } = this.state.instance;
    const editOptions = edit.options();
    const isEdit = editOptions.allowDeleting || editOptions.allowUpdating;
    if (isEdit) {
      const $td = create$('td', { role: 'gridcell', className: cn('editCell') });
      this.view.$target.appendChild($td);
    }
  }

  /**
   * @private
   */
  private _renderGroupCells() {
    const { instance, type } = this.state;
    const { $target } = this.view;
    if (type !== 'group') return;
    const { data } = this.state;

    const { column } = instance;
    const { groupColumnInfos, visibleColumnInfos } = column;
    const groupColumnInfo = instance.column.groupColumnInfos[data.groupIndex];

    $target.innerHTML = '';

    const groupSize = groupColumnInfos.length;
    const colSize = visibleColumnInfos.length;
    groupColumnInfos.forEach((_, index) => {
      if (index <= data.groupIndex) {
        const $td = create$('td', { role: 'gridcell', className: cn('expander') });
        $target.appendChild($td);
        if (index === data.groupIndex) new ExpanderElement(new ExpanderView($td), { instance, data });
      }
    });

    const $td = create$('td', { role: 'gridcell', attr: { colspan: groupSize + colSize - data.groupIndex } });
    $target.appendChild($td);
    const groupCell = new CellElement(new CellView($td), { type: 'group', groupColumnInfo, data, instance });
    this.Cells = [groupCell];
  }

  syncData(data: SourceData) {
    const { type } = this.state;
    //@ts-ignore
    this.state.data = data;
    type === 'data' ? this._renderDataCells() : this._renderGroupCells();
  }

  compareData(data: SourceData) {
    //@ts-ignore
    return isEqual(this.state.data, data);
  }
}
