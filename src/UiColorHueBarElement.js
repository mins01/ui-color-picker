export default class UiColorHueBarElement extends HTMLElement {

    /* =========================
     * static
     * ========================= */

    /** 커스텀 엘리먼트 태그명 */
    static tagName = 'ui-color-hue-bar';

    /** 감시할 속성 목록 */
    static get observedAttributes() {
        return ['hue'];
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

    _h = 0;
    _hFromDown = null;

    /* =========================
     * getter / setter
     * ========================= */

    get h() {
        return this._h;
    }

    set h(value) {
        this._h = Number(value);
        this._syncStyle()
    }

    get hue() {
        return Math.round(this._h);
    }

    set hue(value) {
        this.h = value;
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
        if (name === 'hue') { this.h = newValue; }
    }

    /* =========================
     * public API
     * ========================= */

    setColor(color) {
        if(!color) return;
        const hsl = color.toHsl();
        this.h = hsl.h;
    }

    /* =========================
     * internal utilities
     * ========================= */

    _getHFromEvent(event) {
        return this.dataset.dir === 'horizontal'
            ? (Math.max(0, Math.min(1, event.offsetX / this.offsetWidth)) * 360)
            : (Math.max(0, Math.min(1, event.offsetY / this.offsetHeight)) * 360);
    }

    _syncStyle(){
        this.style.setProperty('--h', this._h);
    }
    /* =========================
     * pointer events
     * ========================= */

    handlePointerdown(event) {
        this.addEventListener('pointermove', this.handlePointermove);
        this.setPointerCapture(event.pointerId);
        this._hFromDown = this.h;
        const h = this._getHFromEvent(event);
        if (h === this.h) return;
        this.h = h;
        this.dispatchEvent(
            new Event('input-hue', { bubbles: true, cancelable: true })
        );
    }

    handlePointermove(event) {
        if (!this.hasPointerCapture(event.pointerId)) return;
        const h = this._getHFromEvent(event);
        if (h === this.h) return;
        this.h = h;
        this.dispatchEvent(
            new Event('input-hue', { bubbles: true, cancelable: true })
        );
    }

    handlePointerup(event) {
        this.removeEventListener('pointermove', this.handlePointermove);
        this.releasePointerCapture(event.pointerId);
        if (this.h === this._hFromDown) {
            this._hFromDown = null;
            return;
        }
        this._hFromDown = null;
        this.dispatchEvent(
            new Event('change-hue', { bubbles: true, cancelable: true })
        );
    }

    handlePointercancel(event) {
        return this.handlePointerup(event);
    }

    /* =========================
     * primitive / serialization
     * ========================= */

    [Symbol.toPrimitive](hint) {
        if (hint === 'number') return this._h;
        if (hint === 'string') return this._h.toString(10);
        return this._h;
    }

    toJSON() {
        return { h: this._h };
    }

    /* =========================
     * render
     * ========================= */

    /** Shadow DOM 렌더링 */
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    --h: 0;
                    --h-position: calc( var(--h,0) / 360 * 100% );
                    --icon-width: 8px;
                    user-select: none;
                    touch-action: none;
                    display: block;
                    min-width: 10px;
                    min-height: 10px;
                    cursor: ns-resize
                }
                :host([data-dir="horizontal"]){
                    cursor: ew-resize
                }
                :host::part(bar){
                    width: 100%;
                    height: 100%;
                    position: relative;
                    overflow: hidden;
                }
                :host::part(bg){
                    pointer-events: none;
                    position: absolute;
                    inset:0px;
                    --bg-direction: to bottom;
                    background: linear-gradient(var(--bg-direction),
                        hsl(0,100%,50%),
                        hsl(30,100%,50%),
                        hsl(60,100%,50%),
                        hsl(90,100%,50%),
                        hsl(120,100%,50%),
                        hsl(150,100%,50%),
                        hsl(180,100%,50%),
                        hsl(210,100%,50%),
                        hsl(240,100%,50%),
                        hsl(270,100%,50%),
                        hsl(300,100%,50%),
                        hsl(330,100%,50%),
                        hsl(360,100%,50%)
                    );
                }
                :host([data-dir="horizontal"])::part(bg){
                    --bg-direction: to right;
                }

                :host::part(hue-indicator){
                    z-index: 2;
                    position: absolute;
                    top: var(--h-position, 0%);
                    transform: translateY(-50%);
                    left: 0;
                    width: 100%;
                    height: 1%;
                    min-width: 0;
                    min-height: 4px;

                    
                }
                :host([data-dir="horizontal"])::part(hue-indicator){
                    flex-direction: column;
                    top: 0;
                    left: var(--h-position, 0%);
                    transform: translateX(-50%);
                    width: 1%;
                    height: 100%;
                    min-width: 4px;
                    min-height: 0;
                }
                :host::part(hue-handle){
                    width: 100%;
                    height: 100%;

                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: visible;
                }

                :host .default-hue-icon{
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    box-sizing: content-box;
                }
                :host .default-hue-icon::before {
                    content: ' ';
                    border: 8px solid #fff;
                    border-width: var(--icon-width);
                    display: block;
                    box-sizing: border-box;
                    border-color: transparent #000 transparent #fff;
                    width: 100%;
                    height: 0%;

                }
                :host([data-dir="horizontal"]) .default-hue-icon::before{
                    border-color: #fff transparent #000 transparent;
                    width: 0%;
                    height: 100%;
                }

            </style>
            <div part="bar">
                <div part="bg"></div>
                <div part="hue-indicator">
                        
                    <div part="hue-handle">
                        <slot name="hue-icon">
                            <div class="default-hue-icon"></div>
                        </slot>
                    </div>
                </div>
                <slot></slot>
            </div>
        `;
    }
}
