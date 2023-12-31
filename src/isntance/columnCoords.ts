import observable from '@/observable';
import { findIndexes, isString, isUndefined, mapProp, sum } from '@/utils/common';
import { ColumnInfo, GroupColumnInfo } from '@t/instance/column';
import { ColumnCoords, ColumnCoordsParam } from '@t/instance/columnCoords';
import { EditOption } from '@t/options';
import toPx from 'to-px';

const MIN_SCROLL_THUMB = 20;

function distributeRemainWidth(widths: number[], remainWidth: number, indexes: number[]) {
  const indexesLength = indexes.length;
  const divideWidth = Math.floor(remainWidth / indexesLength);
  const gapWidth = remainWidth - divideWidth * indexesLength;

  const results = [...widths];
  indexes.forEach((index) => (results[index] += divideWidth));
  if (indexesLength) results[indexes.at(-1) as number] += gapWidth;
  return results;
}

function fillBlankWidths(widths: number[], contentsWidth: number) {
  const remainWidth = contentsWidth - sum(widths);
  const blankIndexes = findIndexes(widths, (value) => !value);

  return distributeRemainWidth(widths, remainWidth, blankIndexes);
}

function applyMinWidth(widths: number[], minWidths: number[]) {
  return widths.map((width, idx) => Math.max(width, minWidths[idx]));
}

function adjustWidths(widths: number[], contentWidth: number, fixedOpts: boolean[]) {
  const colLength = widths.length;
  const extraWidth = contentWidth - sum(widths);
  const dynamicIndexes = findIndexes(fixedOpts, (v) => v === false);
  const fixedColLength = fixedOpts.filter((v) => v === true).length;

  if (extraWidth > 0 && colLength > fixedColLength) {
    return distributeRemainWidth(widths, extraWidth, dynamicIndexes);
  }

  return widths;
}

function calculateWidths(
  contentsWidth: number,
  columnInfos: ColumnInfo[],
  groupColumnInfos: GroupColumnInfo[],
  editOption: EditOption,
  customWidths: Array<number | null> = []
) {
  const baseWidths: number[] = [];
  const minWidths: number[] = [];
  groupColumnInfos.forEach(() => {
    baseWidths.push(0);
    minWidths.push(24);
  });
  columnInfos.forEach(({ width, minWidth }, index) => {
    minWidths.push(Math.max(minWidth ?? 0, customWidths.at(index) ?? 0));
    if (isString(width)) {
      if (width.at(-1) === '%') baseWidths.push((contentsWidth * parseFloat(width)) / 100);
      else baseWidths.push(toPx(width) ?? 0);
    } else baseWidths.push(width ?? 0);
  });

  // editor column
  const { allowDeleting, allowUpdating } = editOption;
  if (allowDeleting || allowUpdating) baseWidths.push(80), minWidths.push(24);

  const fixedOpts = mapProp(columnInfos, 'width').map((item) => item !== 'auto' && !isUndefined(item));
  const expandedWidths = applyMinWidth(baseWidths, minWidths);
  const filledWidths = fillBlankWidths(expandedWidths, contentsWidth);
  const adjWidths = adjustWidths(filledWidths, contentsWidth, fixedOpts);
  const resultWiths = applyMinWidth(
    adjWidths,
    minWidths.map((min) => min || 32)
  );

  return resultWiths;
}

export function create({ column, edit, viewport }: ColumnCoordsParam): ColumnCoords {
  const { visibleColumnInfos, groupColumnInfos } = column;

  const scrollLeft = observable(0);

  const customWidths = observable<Array<null | number>>(visibleColumnInfos.map(() => null));

  const coords = observable(() => {
    const viewportWidth = viewport().width;
    const widths = calculateWidths(viewportWidth, visibleColumnInfos, groupColumnInfos, edit.options(), customWidths());
    const scrollWidth = sum(widths);

    const thumbRatio = viewportWidth / scrollWidth;
    const thumbWidth = isNaN(thumbRatio) ? 0 : Math.round(viewportWidth * thumbRatio * 100) / 100;
    const scrollThumbWidth = Math.max(MIN_SCROLL_THUMB, thumbWidth);
    const scrollThumbDiff = scrollThumbWidth - thumbWidth;

    const translateRatio = scrollLeft() / scrollWidth;
    const scrollbarWidth = viewportWidth - scrollThumbDiff;
    const translateX = Math.min(
      (isNaN(translateRatio) ? 0 : translateRatio) * scrollbarWidth,
      viewportWidth - scrollThumbWidth
    );

    return {
      maxScrollPos: Math.max(scrollWidth - viewportWidth),
      scrollbarSize: scrollbarWidth,
      scrollSize: scrollWidth,
      scrollThumbSize: scrollThumbWidth,
      translate: translateX,
      widths,
    };
  });

  const columnCoords: ColumnCoords = {
    coords,
    customWidths,
    scrollPos: scrollLeft,
  };
  return columnCoords;
}
