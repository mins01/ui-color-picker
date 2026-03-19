import Color from "../third_party/js-color/v2/src/Color.js";

export default class UiColorPlaneSlElement extends HTMLElement {

    /* =========================
     * static
     * ========================= */

    static tagName = 'ui-color-plane-sl';

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
        if (name === 'lightness') this.l = newValue;
        if (name === 'value') this.value = newValue;
    }

    /* =========================
     * public API
     * ========================= */

    setColor(color) {
        if(!color) return;
        const { h, s, l } = color.toHsl();
        
        if( 
            (l===0 && this._l===0) 
            || (l===1 && this._l===1 )
            || (s===0 && this._s===0)
        ){
            // 극단의 색이면 현재를 유지
        }else{
            this.setHsl(h,s,l);
        }
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
        this.style.setProperty('--color-string', this.toHslString());
        this.style.setProperty('--h', this._h);
        this.style.setProperty('--s', this._s);
        this.style.setProperty('--l', this._l);
    }

    /* =========================
     * pointer events
     * ========================= */

    handlePointerdown(event) {
        
        this.setPointerCapture(event.pointerId);
        this.addEventListener('pointermove', this.handlePointermove);

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

    handlePointermove(event) {
        if (!this.hasPointerCapture(event.pointerId)) return;
        const { s, l } = this.#getSLFromEvent(event);
        if (s === this.s && l === this.l) return;
        this.s = s;
        this.l = l;
        this.dispatchEvent(
            new Event('input-sl', { bubbles: true, cancelable: true })
        );
    }

    handlePointerup(event) {
        
        this.releasePointerCapture(event.pointerId);
        this.removeEventListener('pointermove', this.handlePointermove);

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

    handlePointercancel(event) {
        return this.handlePointerup(event);
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
                    --color-string:#000;
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

                    background:linear-gradient(to bottom, hsl(0, 0%, 100%) 0%, hsla(0, 0%, 100%, 0) 50%, hsla(0, 0%, 0%, 0) 50%, hsl(0, 0%, 0%) 100%),
	                linear-gradient(to right, hsla(0, 0%, 50%, 1) 0%, hsla(0, 0%, 50%, 0) 100%),
                    hsl(var(--h,0) 100% 50%);
                }
                
                :host::part(indicator) {
                    position: absolute;
                    top: var(--l-position, 0%);
                    left: var(--s-position, 0%);
                    width: 12px;
                    height: 12px;

                    transform: translate(-50%, -50%);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: visible;
                    
                }
                :host .default-handle{
                    box-shadow:0 0 0 2px hsl(0,0%,calc( clamp(0, (0.5 - var(--l)) * 1000, 1) * 100%) );
                    background-color:var(--color-string,#000);
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