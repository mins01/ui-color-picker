import Color from "../third_party/js-color/v2/src/Color.js";

export default class UiColorWheelElement extends HTMLElement {

    /* =========================
     * static
     * ========================= */

    /** 커스텀 엘리먼트 태그명 */
    static tagName = 'ui-color-wheel';

    /** 이벤트 이름 */
    static inputEventName = 'input-value';
    static changeEventName = 'change-value';

    // 스타일 확장
    static prependStyle = `<style>
                :host {
                    --value: 0;
                    --value-rotation: calc(var(--value, 0) * 360deg);
                    --inner-ratio: 0.8;
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
        const el = event.currentTarget; // 중요!

        // 요소 내부 좌표 (offset 기준)
        const x = event.offsetX;
        const y = event.offsetY;

        // 중심 좌표
        const centerX = el.offsetWidth / 2;
        const centerY = el.offsetHeight / 2;

        // 중심 기준 상대 좌표
        const dx = x - centerX;
        const dy = y - centerY;

        // 각도 계산
        // let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        let angle = (Math.atan2(dy, dx) * 180 / Math.PI + 90 + 360) % 360;

        // 0~360 정규화
        if (angle < 0) angle += 360;
        return (angle%360)/360
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
                    --bg-border-width: 0px;
                    --bg-border-color: #ccc;
                    --bg-border-radius: 0px;

                    user-select: none;
                    touch-action: none;
                    display: block;
                    min-width: 10px;
                    min-height: 10px;
                    aspect-ratio: 1 / 1;

                    
                }
                ::slotted(*) { pointer-events: none; }
                :host::part(wrapper) { width: 100%; height: 100%; position: relative; }
                :host::part(bg) {
                    z-index: 1;
                    pointer-events: none;
                    position: absolute;
                    inset: 0px;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    border-radius:100vmax;
                    box-shadow: 0 0 0 var(--bg-border-width) var(--bg-border-color);
                }
                :host::part(outer-circle) {
                    width: 100%;
                    height: 100%;
                    border-radius:100vmax;
                    background: conic-gradient(
                        black 0deg,
                        white 360deg
                    );
                    -webkit-mask: radial-gradient(farthest-side, transparent calc( var(--inner-ratio)  * 100% - 1px), black calc( var(--inner-ratio)  * 100% ));
                    mask: radial-gradient(farthest-side, transparent calc( var(--inner-ratio)  * 100%  - 1px), black calc( var(--inner-ratio) * 100% ));
                    
                }
                :host::part(inner-circle) {
                    position: absolute;
                    z-index: 1;
                    pointer-events: none;
                    inset: calc((1 - var(--inner-ratio)) / 2 * 100% - 0.5px);
                    border-radius: 100vmax;
                    box-shadow:inset 0 0 0 var(--bg-border-width) var(--bg-border-color);
                }
                
                :host::part(indicator) {
                    pointer-events: all;
                    z-index: 2;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    overflow: visible;
                    position: absolute;
                    top: 0;
                    left:50%;
                    transform-origin: 50% 50%;
                    transform: translateX(-50%) rotate( var(--value-rotation)); 
                    width: 8px;
                    height: 100%;
                    min-width: 0;
                    min-height: 8px;
                }

                :host .default-handle {
                    width: 100%;
                    height: calc( (1 - var(--inner-ratio) ) / 2 * 100% );
                    border-radius: 100px;
                    box-shadow: 0 0 0px 2px #fff, 0 0 0px 4px #000;
                    background-color: rgb(calc(var(--value)*255) calc(var(--value)*255) calc(var(--value)*255));
                    flex: 0 0 auto;
                }

            </style>
            ${this.constructor.appendStyle}
            <div part="wrapper">
                <div part="bg">
                    <div part="outer-circle">
                    </div>
                    <div part="inner-circle">
                    </div>
                </div>
                <div part="indicator">
                    <slot name="handle">
                        <div class="default-handle"></div>
                    </slot>
                </div>
            </div>
        `;
    }
}