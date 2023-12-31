import { entries } from '@/utils/common';
import { findAll$, off, on } from '@/utils/dom';
import { AriaAttributes, AriaRole, CSSProperties, EvtListener } from '@t/html';
import { DataObject } from '@t/index';

/**
 * @template {HTMLElement} T
 */
export default class View<T extends HTMLElement = HTMLElement> {
  #isRender: boolean;
  #target: T;

  constructor(element: Element) {
    if (!element?.nodeType) throw new Error(`Contructor value "element" is not valid element`);
    this.#isRender = false;
    this.#target = element as T;
  }

  get isRender() {
    return this.#isRender;
  }

  /**
   * target element to render
   */
  get $target(): T {
    return this.#target;
  }

  /**
   * Set element template(innerHTML)
   * @returns {string}
   */
  template() {
    return ``;
  }

  /**
   * Bind events
   */
  bindEvents() {}

  /**
   * Render, replace DOM content to virtual DOM content
   */
  render() {
    this.$target.innerHTML = this.template();
    this.bindEvents();
    this.#isRender = true;
  }

  /**
   * Add event listener
   * @template {keyof HTMLElementEventMap} K
   * @param {K} eventType
   * @param {EvtListener<T, K>} listener
   * @param {AddEventListenerOptions} [options]
   */
  on<K extends keyof HTMLElementEventMap>(
    eventType: K,
    listener: EvtListener<T, K>,
    options?: AddEventListenerOptions
  ) {
    const $el = this.$target;
    if ($el) on($el as T, eventType, listener, options);
  }

  /**
   * Remove event listener
   * @template {keyof HTMLElementEventMap} K
   * @param {K} eventType
   * @param {EvtListener<T, K>} listener
   */
  off<K extends keyof HTMLElementEventMap>(eventType: K, listener: EvtListener<T, K>) {
    const $el = this.$target;
    if ($el) off($el as T, eventType, listener);
  }

  /**
   * Trigger custom event
   * @template O
   * @param {keyof HTMLElementEventMap} eventType
   * @param {O} [data] event detail data
   */
  emit<O>(eventType: keyof HTMLElementEventMap, data?: O) {
    const $el = this.$target;
    if (!$el) return;
    const evt = new CustomEvent<O>(eventType, { detail: data });
    $el.dispatchEvent(evt);
  }

  style(style: CSSProperties) {
    // @ts-ignore
    entries(style, (key, value) => (this.$target.style[key] = value));
  }

  aria(attributes: AriaAttributes) {
    // @ts-ignore
    entries(attributes, (key, value) => (this.$target[key] = value));
  }

  dataset(dataset: DataObject<string>) {
    entries(dataset, (key, value) => (this.$target.dataset[key] = value));
  }

  attr(attr: DataObject<string>, cmd: 'set' | 'remove' = 'set') {
    const command: 'setAttribute' | 'removeAttribute' = `${cmd}Attribute`;
    entries(attr, (key, value) => this.$target[command](key, value));
  }

  role(role: AriaRole) {
    this.$target.role = role;
  }

  /**
   * Hide element
   */
  hide(...classList: string[]) {
    const $el = this.$target;
    if (!$el) return;
    if (classList.length) {
      classList.forEach((className) => findAll$(className, $el).forEach((el) => el.classList.add('hui-hidden')));
    } else $el.classList.add('hui-hidden');
  }

  /**
   * Show element
   */
  show(...classList: string[]) {
    const $el = this.$target;
    if (!$el) return;
    if (classList.length) {
      classList.forEach((className) => findAll$(className, $el).forEach((el) => el.classList.remove('hui-hidden')));
    } else $el.classList.remove('hui-hidden');
  }
}
