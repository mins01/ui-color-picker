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
        this.render();
        this.syncStyle();
    }

    disconnectedCallback() {}

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;

        if (name === 'value') { this.value = newValue; }
    }

    /* =========================
     * getter / setter
     * ========================= */

    set value(value) {
        const color = Color.fromString(value);
        this.setColor(color);
    }

    get value() {
        return this.color.toRgbString();
    }

    /* =========================
     * public API
     * ========================= */

    setColor(color) {
        this.color.setColor(color);
        this.syncStyle();
    }

    setRgba(r, g, b, a = null) {
        this.color.setRgba(r, g, b, a);
        this.syncStyle();
    }

    toColor() {
        return this.color.clone();
    }

    /* =========================
     * string / conversion
     * ========================= */

    toString(type = Color.toStringType) {
        return this.color.toString(type);
    }

    /* =========================
     * primitive / serialization
     * ========================= */

    [Symbol.toPrimitive](hint) {
        if (hint === 'number') {
            const color = this.toColor();
            return color.toRgbNumber();
        }
        if (hint === 'string') return this.toHslString();
        return this.toHslString();
    }

    toJSON() {
        return this.color.toJSON();
    }

    /* =========================
     * internal
     * ========================= */

    syncStyle() {
        this.style.setProperty('--color', this.color.toRgbaString());
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