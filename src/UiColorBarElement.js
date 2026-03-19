import Color from "../third_party/js-color/v2/src/Color.js";

export default class UiColorBarElement extends HTMLElement {

    /* =========================
     * static
     * ========================= */

    /** 커스텀 엘리먼트 태그명 */
    static tagName = 'ui-color-bar';

    /** 이벤트 이름 */
    static inputEventName = 'input-value';
    static changeEventName = 'change-value';

    // 스타일 확장
    static prependStyle = `<style>
                :host {
                    --value: 0;
                    --value-position: calc( ( 1 - var(--value,0)) * 100%);
                }
                :host([data-dir="horizontal"]){
                    --value-position: calc( ( var(--value,0)) * 100%);
                }
            </style>`; // 값 초기화 등
    static appendStyle = `<style></style>`; // 커스텀 스타일 등

    /** 감시할 속성 목록 */
    static get observedAttributes() {
        return ['value'];
    }

    /** 커스텀 엘리먼트 등록 */
    static defineCustomElement(tagName = this.tagName) {
        if (!customElements.get(tagName)) {
            customElements.define(tagName, this);
            console.log('defineCustomElement', tagName);
        }
    }

    /* =========================
     * fields
     * ========================= */

    _value = 0;
    _valueFromDown = null;

    /* =========================
     * getter / setter
     * ========================= */

    get value() {
        return this._value;
    }

    set value(v) {
        let n = Number(v);
        if (!Number.isFinite(n)) { throw new TypeError( `Failed to set the 'value' property on '${this.tagName}': The provided value is non-finite.` ); }
        this._value = Math.max(0, Math.min(1, n));
        this._syncStyle();
    }

    /* =========================
     * constructor
     * ========================= */

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    /* =========================
     * lifecycle
     * ========================= */

    connectedCallback() {
        if (!this.shadowRoot.firstChild) this.render();
        this._syncStyle();
        this.addEventListener('pointerdown', this.handlePointerdown);
        this.addEventListener('pointerup', this.handlePointerup);
        this.addEventListener('pointercancel', this.handlePointercancel);
    }

    disconnectedCallback() {
        this.removeEventListener('pointerdown', this.handlePointerdown);
        this.removeEventListener('pointerup', this.handlePointerup);
        this.removeEventListener('pointercancel', this.handlePointercancel);
    }

    /* =========================
     * attribute
     * ========================= */

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        if (name === 'value') { this.value = newValue; }
    }

    /* =========================
     * public API
     * ========================= */

    // 상속받아 재선언 가능
    setColor(color) {
        if(!color) return;
    }

    toColor() {
        // 상속받아 재선언
    }

    /* =========================
     * internal utilities
     * ========================= */

    _getHFromEvent(event) {
        return this.dataset.dir === 'horizontal'
            ? (Math.max(0, Math.min(1, event.offsetX / this.offsetWidth)))
            : 1-(Math.max(0, Math.min(1, event.offsetY / this.offsetHeight))); //y축은 inverse
    }

    _syncStyle() {
        this.style.setProperty('--value', this.value);
    }

    /* =========================
     * pointer events
     * ========================= */

    handlePointerdown(event) {
        this.addEventListener('pointermove', this.handlePointermove);
        this.setPointerCapture(event.pointerId);
        this._valueFromDown = this.value;
        const val = this._getHFromEvent(event);
        if (val === this.value) return;
        this.value = val;
        this.dispatchEvent(new Event(this.constructor.inputEventName, { bubbles: true, cancelable: true }));
    }

    handlePointermove(event) {
        if (!this.hasPointerCapture(event.pointerId)) return;
        const val = this._getHFromEvent(event);
        if (val === this.value) return;
        this.value = val;
        this.dispatchEvent(new Event(this.constructor.inputEventName, { bubbles: true, cancelable: true }));
    }

    handlePointerup(event) {
        this.removeEventListener('pointermove', this.handlePointermove);
        this.releasePointerCapture(event.pointerId);
        if (this.value === this._valueFromDown) {
            this._valueFromDown = null;
            return;
        }
        this._valueFromDown = null;
        this.dispatchEvent(new Event(this.constructor.changeEventName, { bubbles: true, cancelable: true }));
    }

    handlePointercancel(event) {
        return this.handlePointerup(event);
    }

    /* =========================
     * primitive / serialization
     * ========================= */

    [Symbol.toPrimitive](hint) {
        if (hint === 'number') return this.value;
        if (hint === 'string') return this.value.toString(10);
        return this.value;
    }

    toJSON() {
        return { value: this._value };
    }

    /* =========================
     * render
     * ========================= */

    render() {
        this.shadowRoot.innerHTML = `
            ${this.constructor.prependStyle}
            <style>
                :host {
                    user-select: none;
                    touch-action: none;
                    display: block;
                    min-width: 10px;
                    min-height: 10px;
                }
                ::slotted(*) { pointer-events: none; }
                :host::part(bar) { width: 100%; height: 100%; position: relative; }
                :host::part(bg) {
                    z-index: 1;
                    pointer-events: none;
                    position: absolute;
                    inset: 0px;
                    --bg-direction: to top;
                    background: linear-gradient(var(--bg-direction), rgb(0 0 0 / 1),  rgb(255 255 255 / 1));
                    box-shadow: inset 0 0 0 1px #ccc;
                }
                :host([data-dir="horizontal"])::part(bg) { --bg-direction: to right; }
                :host::part(indicator) {
                    z-index: 2;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: visible;
                    position: absolute;
                    top: var(--value-position, 0%);
                    transform: translateY(-50%);
                    left: 0;
                    width: 100%;
                    height: 1%;
                    min-width: 0;
                    min-height: 8px;
                }

                :host([data-dir="horizontal"])::part(indicator) {
                    flex-direction: column;
                    top: 0;
                    left: var(--value-position, 0%);
                    transform: translateX(-50%);
                    width: 1%;
                    height: 100%;
                    min-width: 8px;
                    min-height: 0;
                }

                :host .default-handle {
                    width: 100%;
                    height: 100%;
                    border-radius: 100px;
                    box-shadow: 0 0 0px 2px #fff, 0 0 0px 4px #000;
                    background-color: rgb(calc(var(--value)*255) calc(var(--value)*255) calc(var(--value)*255));
                    flex: 0 0 auto;
                }

            </style>
            ${this.constructor.appendStyle}
            <div part="bar">
                <div part="bg"></div>
                <div part="indicator">
                    <slot name="handle">
                        <div class="default-handle"></div>
                    </slot>
                </div>
                <slot></slot>
            </div>
        `;
    }
}