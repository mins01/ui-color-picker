import Color from "../third_party/js-color/v2/src/Color.js";

export default class UiColorElement extends HTMLElement {

    /* =========================
     * static
     * ========================= */

    /** 커스텀 엘리먼트 태그명 */
    static tagName = 'ui-color';

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

    color = new Color();

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
    }

    // disconnectedCallback() {}

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        if (name === 'value') { this.value = newValue; }
    }

    /* =========================
     * getter / setter
     * ========================= */

    set value(value) {
        const color = Color.fromString(value);
        if(color) this.setColor(color);
    }

    get value() {
        return this.toString();
    }

    /* =========================
     * public API
     * ========================= */

    setColor(color) {
        if(!color) return;
        if(this.color.equals(color)) return;
        this.color.setColor(color);
        this._syncStyle();
    }

    setRgba(r, g, b, a = null) {
        const color = Color.fromRgba(r, g, b, a)
        this.setColor(color)
    }

    toColor() {
        return this.color.clone();
    }

    /* =========================
     * string / conversion
     * ========================= */

    toString(type = this.color.toStringType) {
        return this.color.toString(type);
    }

    /* =========================
     * primitive / serialization
     * ========================= */

    [Symbol.toPrimitive](hint) {
        if (hint === 'number') { return this.color.toRgbNumber(); }
        if (hint === 'string') return this.toString();
        return this.toString();
    }

    toJSON() {
        return this.color.toJSON();
    }

    /* =========================
     * internal
     * ========================= */

    _syncStyle() {
        this.style.setProperty('--color', this.color.toRgbString());
        this.style.setProperty('--r', this.color.r);
        this.style.setProperty('--g', this.color.g);
        this.style.setProperty('--b', this.color.b);
        const hsl = this.color.toHsl()
        this.style.setProperty('--h', hsl.h);
        this.style.setProperty('--s', hsl.s);
        this.style.setProperty('--l', hsl.l);
    }

    /* =========================
     * render
     * ========================= */

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    --color: rgb(0, 0, 0);
                    display: block;
                    min-width: 20px;
                    min-height: 20px;
                    background-color: var(--color, rgb(0, 0, 0));
                }
            </style>
            <slot></slot>
        `;
    }
}