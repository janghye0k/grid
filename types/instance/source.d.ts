import { DataObject } from '@t/index';
import { Observable } from '@t/observable';

export interface SourceParams {
  keyExpr?: string;
}

export interface Source {
  store: Observable<DataObject[]>;
  items: () => DataObject[];
  changes: () => SourceChangeItem[];
  setData: (datas: DataObject[]) => void;
  insert: (...datas: DataObject[]) => void;
  update: (key: string, data: Partial<DataObject>) => void;
  remove: (key: string) => void;
  clear: () => void;
}

export type SourceChangeItem<T extends DataObject = DataObject> =
  | { type: 'insert'; key: string; data: T }
  | { type: 'update'; key: string; data: Partial<T> }
  | { type: 'remove'; key: string };

export type SourceChangeType = SourceChangeItem['type'];

export interface SourceChanges {
  [key: string]: SourceChangeItem;
}