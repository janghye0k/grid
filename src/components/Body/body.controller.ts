import Controller from '@/mvc/Controller';
import { BodyState } from './body.model';
import { cn } from '@/data/className';
import { isString } from '@/utils/common';
import { isEqual } from 'lodash-es';
import { DataObject } from '@t/index';

export default class BodyController extends Controller<BodyState> {
  effect(): void {
    this._syncNodata();
    this._syncData();
  }

  /**
   * Sync option nodata & body nodata
   */
  private _syncNodata() {
    const { nodata } = this.model.state;
    nodata.subscribe((state) => {
      const $nodata = this.$target.querySelector(cn('nodata', true));
      if (!state || !$nodata) return;
      if (isString(state)) $nodata.innerHTML = state;
      else ($nodata.innerHTML = ''), $nodata.appendChild(state);
    }, true);
  }

  private _syncData() {
    const { source } = this.model.state;
    source.store.subscribe((cur, prev) => {
      if (isEqual(cur, prev)) return;
      this.handleChangeDatas(cur);
    }, true);
  }

  handleChangeDatas(datas: DataObject[]) {
    console.log(datas);
  }
}
