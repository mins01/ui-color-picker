import Color from "../third_party/js-color/v2/src/Color.js";

export default class UiColorBarElement extends HTMLElement {

    /* =========================
     * static
     * ========================= */

    /** 커스텀 엘리먼트 태그명 */
    static tagName = 'ui-color-bar';
    

    static inputEventName = 'input-raw';
    static changeEventName = 'change-raw';

    // 스타일 확장
    static extendedStyle = `<style></style>`;

    /** 감시할 속성 목록 */
    static get observedAttributes() {
        return ['raw'];
    }

    /** 커스텀 엘리먼트 등록 */
    static defineCustomElement(tagName = this.tagName) {
        if (!customElements.get(tagName)) {
            customElements.define(tagName, this);
        }
    }

    /* =========================
     * fields
     * ========================= */

    _raw = 0;
    _rawFromDown = null;

    /* =========================
     * getter / setter
     * ========================= */

    get raw() {
        return this._raw;
    }

    set raw(value) {
        this._raw = Number(value);
        this._syncStyle()
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
        if (name === 'raw') { this.raw = newValue; }
    }

    /* =========================
     * public API
     * ========================= */

    // 여기선 아무작업 안한다. 상속 받는 쪽에서 다시 재선언해라
    setColor(color) {
        if(!color) return;
        
    }
    // 여기선 아무작업 안한다. 상속 받는 쪽에서 다시 재선언해라
    toColor(){
        
    }

    /* =========================
     * internal utilities
     * ========================= */

    _getHFromEvent(event) {
        return this.dataset.dir === 'horizontal'
            ? (Math.max(0, Math.min(1, event.offsetX / this.offsetWidth)))
            : (Math.max(0, Math.min(1, event.offsetY / this.offsetHeight)));
    }

    // 재선언해서 쓰자
    _syncStyle(){
        this.style.setProperty('--raw', this.raw);
    }
    /* =========================
     * pointer events
     * ========================= */

    handlePointerdown(event) {
        this.addEventListener('pointermove', this.handlePointermove);
        this.setPointerCapture(event.pointerId);
        this._rawFromDown = this.raw;
        const raw = this._getHFromEvent(event);
        if (raw === this.raw) return;
        this.raw = raw;
        this.dispatchEvent(
            new Event(this.constructor.inputEventName, { bubbles: true, cancelable: true })
        );
    }

    handlePointermove(event) {
        if (!this.hasPointerCapture(event.pointerId)) return;
        const raw = this._getHFromEvent(event);
        if (raw === this.raw) return;
        this.raw = raw;
        this.dispatchEvent(
            new Event(this.constructor.inputEventName, { bubbles: true, cancelable: true })
        );
    }

    handlePointerup(event) {
        this.removeEventListener('pointermove', this.handlePointermove);
        this.releasePointerCapture(event.pointerId);
        if (this.raw === this._rawFromDown) {
            this._rawFromDown = null;
            return;
        }
        this._rawFromDown = null;
        this.dispatchEvent(
            new Event(this.constructor.changeEventName, { bubbles: true, cancelable: true })
        );
    }

    handlePointercancel(event) {
        return this.handlePointerup(event);
    }

    /* =========================
     * primitive / serialization
     * ========================= */

    [Symbol.toPrimitive](hint) {
        if (hint === 'number') return this.raw;
        if (hint === 'string') return this.raw.toString(10);
        return this.raw;
    }

    toJSON() {
        return { v: this._raw };
    }

    /* =========================
     * render
     * ========================= */

    /** Shadow DOM 렌더링 */
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    --raw: 0;
                    --raw-position: calc( var(--raw,0) * 100% );
                    user-select: none;
                    touch-action: none;
                    display: block;
                    min-width: 10px;
                    min-height: 10px;
                }
                ::slotted(*) {
                    pointer-events: none;
                }
                :host::part(bar){
                    width: 100%;
                    height: 100%;
                    position: relative;
                }
                :host::part(bg){
                    z-index: 1;
                    pointer-events: none;
                    position: absolute;
                    inset:0px;
                    --bg-direction: to bottom;
                    background: linear-gradient(var(--bg-direction),
                        rgb(0 0 0 / 1),
                        rgb(255 255 255 / 1)
                    );
                    box-shadow: inset 0 0 0 1px #ccc;
                }
                :host([data-dir="horizontal"])::part(bg){
                    --bg-direction: to right;
                }
                :host::part(indicator){
                    z-index: 2;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: visible;
                    position: absolute;
                    top: var(--raw-position, 0%);
                    transform: translateY(-50%);
                    left: 0;
                    width: 100%;
                    height: 1%;
                    min-width: 0;
                    min-height: 8px;
                }
                :host([data-dir="horizontal"])::part(indicator){
                    flex-direction: column;
                    top: 0;
                    left: var(--raw-position, 0%);
                    transform: translateX(-50%);
                    width: 1%;
                    height: 100%;
                    min-width: 8px;
                    min-height: 0;
                }
                :host .default-handle{
                    width: 100%;
                    height: 100%;
                    border-radius:100px;
                    box-shadow: 0 0 0px 2px #fff, 0 0 0px 4px #000;
                    background-color:rgb( calc(var(--raw)*255) calc(var(--raw)*255) calc(var(--raw)*255));
                    flex:0 0 auto;
                }


            </style>
            ${this.constructor.extendedStyle}
            <div part="bar">
                <div part="bg"></div>
                <div part="indicator" class="indicator">
                    <slot name="handle">
                        <div class="default-handle"></div>
                    </slot>
                </div>
                <slot></slot>
            </div>
        `;
    }
}
