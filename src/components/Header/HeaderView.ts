import { cn, cns } from '@/healpers/className';
import { View } from '@/components/core';

export default class HeaderView extends View {
  template(): string {
    this.role('presentation');
    this.$target.classList.add(cn('header'));
    return /*html*/ `
      <div class="${cn('scrollContainer')}" role="presentation">
        <table class="${cns('table', 'tableFixed').join(' ')}" role="presentation">
          <colgroup></colgroup>
          <tbody role="presentation">
          </tbody>
        </table>
      </div>
    `;
  }
}
