import Color from "../third_party/js-color/v2/src/Color.js";

export default class UiColorPickerElement extends HTMLElement {

    /* =========================
     * static
     * ========================= */

    /** 커스텀 엘리먼트 태그명 */
    static tagName = 'ui-color-picker';

    /** 감시할 속성 목록 */
    static get observedAttributes() {
        return ['value'];
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

    /** 현재 색 */
    selectedColor = new Color(0,0,0,1)
    color = this.selectedColor; // alias of selectedColor

    /** 선택중인 색 */
    pendingColor = new Color(0,0,0,1);

    /* =========================
     * constructor
     * ========================= */

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.addEventListener('input-sl', this.oninputSl.bind(this));
        this.addEventListener('change-sl', this.onchangeSl.bind(this));
        this.addEventListener('input-hue', this.oninputHue.bind(this));
        this.addEventListener('change-hue', this.onchangeHue.bind(this));
    }

    /* =========================
     * lifecycle
     * ========================= */

    connectedCallback() {
        
        this.pendingColor.setColor(this.selectedColor);
        this.render();
        this.syncSelectedColor();
        this.syncPartSelectedColor();
        this.syncPendingColor();
    }

    disconnectedCallback() {}

    /* =========================
     * attribute
     * ========================= */

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;

        if (name === 'value') {
            this.value = newValue;
        }
    }

    /* =========================
     * getter / setter
     * ========================= */

    set value(value) {
        this.selectedColor.setString(value);
        this.syncSelectedColor()
    }

    get value() {
        return this.selectedColor.toRgbString();
    }

    /* =========================
     * public API
     * ========================= */

    setColor(color) {
        this.selectedColor.setColor(color);
    }

    toColor() {
        return this.selectedColor.clone();
    }

    toHsl() {
        return this.selectedColor.toHsl();
    }

    syncSelectedColor() {
        document.querySelectorAll('.sync-selected-color').forEach((el) => {
            el.setColor(this.selectedColor);
        })
    }
    syncPartSelectedColor() {
        document.querySelectorAll('.sync-part-selected-color').forEach((el) => {
            el.setColor(this.selectedColor);
        })
    }
    syncPendingColor(color) {
        if(color){this.pendingColor.setColor(color)}
        document.querySelectorAll('.sync-pending-color').forEach((el) => {
            el.setColor(this.pendingColor);
        })
    }
    syncHueBar(target) {
        console.log(target.h);
        
        document.querySelectorAll('.sync-hue-bar').forEach((el) => {
            el.h = target.h;
        })
    }

    confirm() {
        this.selectedColor.setColor(this.pendingColor);
        this.syncSelectedColor()
        this.dispatchEvent(new Event('confirm-color-picker', { bubbles: true, cancelable: true }));
    }
    cancel() {
        if(!this.pendingColor.equals(this.selectedColor)) this.syncPartSelectedColor();
        this.pendingColor.setColor(this.selectedColor);
        this.syncPendingColor()
        
        this.dispatchEvent(new Event('cancel-color-picker', { bubbles: true, cancelable: true }));
    }

    /* =========================
     * event handlers
     * ========================= */

    oninputHue(event) {
        const target = event.target;

        const hsl = this.pendingColor.toHsl();
        hsl.h = target.h;

        this.pendingColor.setHsla(hsl.h, hsl.s, hsl.l);
        this.syncHueBar(target)
        this.syncPendingColor();
    }

    onchangeHue(event) {
        return this.oninputHue(event);
    }

    oninputSl(event) {
        const target = event.target;

        const hsl = this.pendingColor.toHsl();
        hsl.s = target.s;
        hsl.l = target.l;

        this.pendingColor.setHsla(hsl.h, hsl.s, hsl.l);
        this.syncPendingColor();
    }

    onchangeSl(event) {
        return this.oninputSl(event);
    }

    /* =========================
     * conversion / util
     * ========================= */

    toHslString() {
        return `hsl(${this.hue}, ${this.saturation} ${this.lightness})`;
    }

    toString(type = Color.toStringType) {
        return this.selectedColor.toString(type);
    }

    /* =========================
     * primitive / serialization
     * ========================= */

    [Symbol.toPrimitive](hint) {
        if (hint === 'number') {
            const color = this.toColor();
            return color.toRgbNumber();
        }

        if (hint === 'string') {
            return this.toHslString();
        }

        return this.toHslString();
    }

    toJSON() {
        return this.selectedColor.toJSON();
    }

    /* =========================
     * render
     * ========================= */

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    min-width: 20px;
                    min-height: 20px;
                }
            </style>
            <slot></slot>
        `;
    }
}