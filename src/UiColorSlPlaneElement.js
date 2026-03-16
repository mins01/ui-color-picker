import Color from "../third_party/js-color/v2/src/Color.js";

export default class UiColorSlPlaneElement extends HTMLElement {

    /* =========================
     * static
     * ========================= */

    static tagName = 'ui-color-sl-plane';

    static get observedAttributes() {
        return ['hue', 'saturation', 'lightness', 'value'];
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
    _l = 0;

    _sFromDown = null;
    _lFromDown = null;

    /* =========================
     * getter / setter
     * ========================= */

    get h() { return this._h; }
    set h(value) {
        return this.setHsl(value,null,null);
    }

    get hue() { return Math.round(this._h); }
    set hue(value) { this.h = value; }

    get s() { return this._s; }
    set s(value) {
        return this.setHsl(null,value,null);
    }

    get saturation() {
        return Math.round(this._s * 100)+'%';
    }

    set saturation(value) { this.s = value; }

    get l() { return this._l; }
    set l(value) {
        return this.setHsl(null,null,value);
    }

    get lightness() {
        return Math.round(this._l * 100)+'%';
    }

    set lightness(value) { this.l = value; }


    set value(value) {
        const color = Color.fromString(value)
        this.setColor(color)
    }

    get value() {
        return this.toHslString();
    }

    /* =========================
     * constructor
     * ========================= */

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        this.addEventListener('pointerdown', this.onpointerdown.bind(this));
        this.addEventListener('pointermove', this.onpointermove.bind(this));
        this.addEventListener('pointerup', this.onpointerup.bind(this));
        this.addEventListener('pointercancel', this.onpointercancel.bind(this));
    }

    /* =========================
     * lifecycle
     * ========================= */

    connectedCallback() {
        if (!this.shadowRoot.firstChild) this.render(); 
        this._syncStyle();
    }

    disconnectedCallback() {}

    /* =========================
     * attribute
     * ========================= */

    attributeChangedCallback(name, oldValue, newValue) {

        if (oldValue === newValue) return;

        if (name === 'hue') this.h = newValue;
        if (name === 'saturation') this.s = newValue;
        if (name === 'lightness') this.l = newValue;
        if (name === 'value') this.value = newValue;
    }

    /* =========================
     * public API
     * ========================= */

    setColor(color) {
        const { h, s, l } = color.toHsl();
        this.setHsl(h,s,l);
    }
    setHsl(h=null,s=null,l=null){
        if(h !== null) this._h = Number(h);
        if(s !== null){
            if (typeof s === 'string' && s.endsWith('%')) {
                s = parseFloat(s) / 100;
            } else {
                s = Number(s);
            }
            this._s = Math.max(0, Math.min(1, s));
        }
        if(l !== null){
            if (typeof l === 'string' && l.endsWith('%')) {
                l = parseFloat(l) / 100;
            } else {
                l = Number(l);
            }
            this._l = Math.max(0, Math.min(1, l));
        }
        this._syncStyle();

    }

    toColor() {
        const color = new Color();
        color.setHsla(this.h, this.s, this.l);
        return color;
    }

    toHsl() {
        return {
            h: this._h,
            s: this._s,
            l: this._l
        };
    }

    /* =========================
     * internal util
     * ========================= */

    #getSLFromEvent(event) {
        return {
            s: Math.max(0, Math.min(1, event.offsetX / this.offsetWidth)),
            l: 1 - Math.max(0, Math.min(1, event.offsetY / this.offsetHeight))
        };
    }
    _syncStyle(){
        this.style.setProperty('--h', this._h);
        this.style.setProperty('--s', this._s);
        this.style.setProperty('--l', this._l);
    }

    /* =========================
     * pointer events
     * ========================= */

    onpointerdown(event) {

        this.setPointerCapture(event.pointerId);

        this._sFromDown = this.s;
        this._lFromDown = this.l;

        const { s, l } = this.#getSLFromEvent(event);

        if (s === this.s && l === this.l) return;

        this.s = s;
        this.l = l;

        this.dispatchEvent(
            new Event('input-sl', { bubbles: true, cancelable: true })
        );
    }

    onpointermove(event) {

        if (!this.hasPointerCapture(event.pointerId)) return;

        const { s, l } = this.#getSLFromEvent(event);

        if (s === this.s && l === this.l) return;

        this.s = s;
        this.l = l;

        this.dispatchEvent(
            new Event('input-sl', { bubbles: true, cancelable: true })
        );
    }

    onpointerup(event) {

        this.releasePointerCapture(event.pointerId);

        if (this.s === this._sFromDown && this.l === this._lFromDown) {

            this._sFromDown = null;
            this._lFromDown = null;
            return;
        }

        this._sFromDown = null;
        this._lFromDown = null;

        this.dispatchEvent(
            new Event('change-sl', { bubbles: true, cancelable: true })
        );
    }

    onpointercancel(event) {
        return this.onpointerup(event);
    }

    /* =========================
     * conversion
     * ========================= */

    toHslString() {
        return `hsl(${this.hue}, ${this.saturation}, ${this.lightness})`;
    }

    toString() {
        return this.toHslString();
    }

    /* =========================
     * primitive / serialization
     * ========================= */

    [Symbol.toPrimitive](hint) {
        if (hint === 'number') {
            return this.toColor().toRgbNumber();
        }
        if (hint === 'string') {
            return this.toHslString();
        }
        return this.toHslString();
    }

    toJSON() {
        return {
            h: this._h,
            s: this._s,
            l: this._l
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
                    --l: 0;
                    --h-position: calc( var(--h,0) / 360 * 100% );
                    --s-position: calc( var(--s,0) * 100% );
                    --l-position: calc( ( 1 - var(--l,0) ) * 100% );
                    user-select: none;
                    touch-action: none;
                    display: block;
                    min-width: 10px;
                    min-height: 10px;
                    cursor: crosshair;
                }
                :host::part(plane){
                    width: 100%;
                    height: 100%;
                    position: relative;
                    overflow: hidden;
                    pointer-events: none;
                }
                :host::part(bg){
                    pointer-events: none;
                    position: absolute;
                    inset:0px;

                    background:linear-gradient(to bottom, hsl(0, 0%, 100%) 0%, hsla(0, 0%, 100%, 0) 50%, hsla(0, 0%, 0%, 0) 50%, hsl(0, 0%, 0%) 100%),
	                linear-gradient(to right, hsla(0, 0%, 50%, 1) 0%, hsla(0, 0%, 50%, 0) 100%),
                    hsl(var(--h,0) 100% 50%);
                }
                
                :host::part(sl-indicator) {
                    position: absolute;
                    top: var(--l-position, 0%);
                    left: var(--s-position, 0%);
                    width: 8px;
                    height: 8px;

                    transform: translate(-50%, -50%);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: visible;
                }
                :host::part(sl-handle){
                    width: 100%;
                    height: 100%;
                    border:2px solid rgba(255, 255, 255, 0.75);
                    border-radius: 50%;
                    border-color:rgba(255, 255, 255, 1) rgba(0,0,0, 1)  rgba(255, 255, 255, 1) rgba(0,0,0, 1);
                    flex: 0 0 100%;
                }
                :host::part(sl-icon){
                    width: 100%;
                    height: 100%;
                }
            </style>
            <div part="plane">
                <div part="bg">
                </div>
                <div part="sl-indicator">
                    <div part="sl-handle">
                        <div part="sl-icon"></div>
                    </div>
                </div>
                <slot></slot>
            </div>
        `;
    }
}