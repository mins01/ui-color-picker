import Color from "../third_party/js-color/v2/src/Color.js";

export default class UiColorSbPlaneElement extends HTMLElement {

    /* =========================
     * static
     * ========================= */

    static tagName = 'ui-color-sb-plane';

    static get observedAttributes() {
        return ['hue', 'saturation', 'brightness', 'value'];
    }

    static defineCustomElement(tagName = this.tagName) {
        if (!customElements.get(tagName)) {
            customElements.define(tagName, this);
        }
    }

    /* =========================
     * fields
     * ========================= */

    _h = 0;
    _s = 0;
    _b = 0;

    _sFromDown = null;
    _bFromDown = null;

    /* =========================
     * getter / setter
     * ========================= */

    get h() { return this._h; }
    set h(value) {
        return this.setHsb(value,null,null);
    }

    get hue() { return Math.round(this._h); }
    set hue(value) { this.h = value; }

    get s() { return this._s; }
    set s(value) {
        return this.setHsb(null,value,null);
    }

    get saturation() {
        return Math.round(this._s * 100)+'%';
    }

    set saturation(value) { this.s = value; }

    get b() { return this._b; }
    set b(value) {
        return this.setHsb(null,null,value);
    }

    get brightness() {
        return Math.round(this._b * 100)+'%';
    }

    set brightness(value) { this.b = value; }


    set value(value) {
        const color = Color.fromString(value)
        this.setColor(color)
    }

    get value() {
        return this.toHsbString();
    }

    get color(){
        return this.toColor()
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

        if (name === 'hue') this.h = newValue;
        if (name === 'saturation') this.s = newValue;
        if (name === 'brightness') this.b = newValue;
        if (name === 'value') this.value = newValue;
    }

    /* =========================
     * public API
     * ========================= */

    setColor(color) {
        if(!color) return;
        const { h, s, b } = color.toHsb();
        this.setHsb(h,s,b);
    }
    setHsb(h=null,s=null,b=null){
        if(h !== null) this._h = Number(h);
        if(s !== null){
            if (typeof s === 'string' && s.endsWith('%')) {
                s = parseFloat(s) / 100;
            } else {
                s = Number(s);
            }
            this._s = Math.max(0, Math.min(1, s));
        }
        if(b !== null){
            if (typeof b === 'string' && b.endsWith('%')) {
                b = parseFloat(b) / 100;
            } else {
                b = Number(b);
            }
            this._b = Math.max(0, Math.min(1, b));
        }
        this._syncStyle();

    }

    toColor() {
        const color = new Color();
        color.setHsba(this.h, this.s, this.b);
        return color;
    }

    toHsb() {
        return {
            h: this._h,
            s: this._s,
            b: this._b
        };
    }

    /* =========================
     * internal util
     * ========================= */

    #getSBFromEvent(event) {
        return {
            s: Math.max(0, Math.min(1, event.offsetX / this.offsetWidth)),
            b: 1 - Math.max(0, Math.min(1, event.offsetY / this.offsetHeight))
        };
    }
    _syncStyle(){
        this.style.setProperty('--h', this._h);
        this.style.setProperty('--s', this._s);
        this.style.setProperty('--b', this._b);
    }

    /* =========================
     * pointer events
     * ========================= */

    handlePointerdown(event) {

        this.setPointerCapture(event.pointerId);
        this.addEventListener('pointermove', this.handlePointermove);

        this._sFromDown = this.s;
        this._bFromDown = this.b;

        const { s, b } = this.#getSBFromEvent(event);

        if (s === this.s && b === this.b) return;

        this.s = s;
        this.b = b;

        this.dispatchEvent(
            new Event('input-sb', { bubbles: true, cancelable: true })
        );

    }

    handlePointermove(event) {
        if (!this.hasPointerCapture(event.pointerId)) return;
        const { s, b } = this.#getSBFromEvent(event);
        if (s === this.s && b === this.b) return;
        this.s = s;
        this.b = b;
        this.dispatchEvent(
            new Event('input-sb', { bubbles: true, cancelable: true })
        );
    }

    handlePointerup(event) {

        this.releasePointerCapture(event.pointerId);
        this.removeEventListener('pointermove', this.handlePointermove);

        if (this.s === this._sFromDown && this.b === this._bFromDown) {

            this._sFromDown = null;
            this._bFromDown = null;
            return;
        }

        this._sFromDown = null;
        this._bFromDown = null;

        this.dispatchEvent(
            new Event('change-sb', { bubbles: true, cancelable: true })
        );

    }

    handlePointercancel(event) {
        return this.handlePointerup(event);
    }

    /* =========================
     * conversion
     * ========================= */

    toHsbString() {
        return `hsb(${this.hue}, ${this.saturation}, ${this.brightness})`;
    }

    toString() {
        return this.toHsbString();
    }

    /* =========================
     * primitive / serialization
     * ========================= */

    [Symbol.toPrimitive](hint) {
        if (hint === 'number') {
            return this.toColor().toRgbNumber();
        }
        if (hint === 'string') {
            return this.toHsbString();
        }
        return this.toHsbString();
    }

    toJSON() {
        return {
            h: this._h,
            s: this._s,
            b: this._b
        };
    }

    /* =========================
     * render
     * ========================= */
        render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    --h: 0;
                    --s: 0;
                    --b: 0;
                    --s-position: calc( var(--s,0) * 100% );
                    --b-position: calc( ( 1 - var(--b,0) ) * 100% );
                    user-select: none;
                    touch-action: none;
                    display: block;
                    min-width: 10px;
                    min-height: 10px;
                }
                ::slotted(*) {
                    pointer-events: none;
                }
                :host::part(plane){
                    width: 100%;
                    height: 100%;
                    position: relative;
                    pointer-events: none;
                }
                :host::part(bg){
                    pointer-events: none;
                    position: absolute;
                    inset:0px;

                    background: linear-gradient(to bottom, transparent 0%, black 100%),
                        linear-gradient(to right, white 0%, hsl(var(--h,0), 100%, 50%) 100%);
                }

                :host::part(sb-indicator) {
                    position: absolute;
                    top: var(--b-position, 0%);
                    left: var(--s-position, 0%);
                    width: 12px;
                    height: 12px;

                    transform: translate(-50%, -50%);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: visible;

                }
                :host .default-sb-handle{
                    box-shadow:0 0 0 2px hsl(0,0%,calc( clamp(0, (var(--b) - 0.3) * 1000, 1) * 100%) );
                    background-color: color-mix(in srgb,
                        color-mix(in srgb, white calc((1 - var(--s)) * 100%), hsl(var(--h), 100%, 50%)),
                        black calc((1 - var(--b)) * 100%)
                    );
                    border-radius: 50%;
                    flex: 0 0 100%;
                    width: 100%;
                    height: 100%;
                    display: block;
                    box-sizing:content-box;
                }
            </style>
            <div part="plane">
                <div part="bg">
                </div>
                <div part="sb-indicator">
                    <slot name="sb-handle">
                        <div class="default-sb-handle"></div>
                    </slot>
                </div>
                <slot></slot>
            </div>
        `;
    }
}
