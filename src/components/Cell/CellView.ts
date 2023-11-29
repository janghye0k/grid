import { View } from '@/components/core';

export default class CellView extends View<HTMLTableCellElement> {
  template(): string {
    this.role('gridcell');
    return /*html*/ ``;
  }

  get columnindex() {
    const colIndex = this.$target.ariaColIndex;
    return !colIndex ? -1 : Number(colIndex);
  }

  get rowindex() {
    const rowIndex = this.$target.parentElement?.ariaRowIndex;
    return !rowIndex ? -1 : Number(rowIndex);
  }

  setTemplate(...templates: Array<string | Node | Element>) {
    this.$target.replaceChildren(...templates);
  }
}
