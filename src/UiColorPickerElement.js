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

    maxSwatches = 30;

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
        this.addEventListener('input', this.oninput.bind(this));
    }

    /* =========================
     * lifecycle
     * ========================= */

    connectedCallback() {
        
        this.pendingColor.setColor(this.selectedColor);
        this.render();
        this.syncSelectedColor();
        this.syncPartColorForSelected();
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
        this.setPendingColor(color)
        this.setSelectedColor(color)
    }
    setPendingColor(color) {
        this.pendingColor.setColor(color);
        this.syncPendingColor();
        this.syncPartColorForPending();
    }
    setSelectedColor(color) {
        this.selectedColor.setColor(color);
        this.syncSelectedColor();
        this.syncPartColorForSelected();
    }

    toColor() {
        return this.selectedColor.clone();
    }

    toHsl() {
        return this.selectedColor.toHsl();
    }

    syncSelectedColor() {
        document.querySelectorAll('.sync-selected-color').forEach((el) => {
            this.syncToElement(this.selectedColor,el);
        })
    }
    syncPartColorForSelected() {
        document.querySelectorAll('.sync-part-color').forEach((el) => {
            this.syncToElement(this.selectedColor,el);
        })
    }
    syncPendingColor() {
        document.querySelectorAll('.sync-pending-color').forEach((el) => {
            this.syncToElement(this.pendingColor,el);
        })
    }
    syncPartColorForPending(){
        document.querySelectorAll('.sync-part-color').forEach((el) => {
            this.syncToElement(this.pendingColor,el);
        })
    }
    syncHueBar(target) {
        console.log(target.h);    
        document.querySelectorAll('.sync-hue-bar').forEach((el) => {
            el.h = target.h;
        })
    }

    syncToElement(color,toElement){
        if(toElement.setColor) toElement.setColor(color);
        if ('value' in toElement) { 
            const str = color.toString(toElement.dataset.toStringType);
            console.log(str);
            
            if(toElement.value !== str) toElement.value = str;
        }
    }

    confirm() {
        this.selectedColor.setColor(this.pendingColor);
        this.syncSelectedColor()
        this.dispatchEvent(new Event('confirm-color-picker', { bubbles: true, cancelable: true }));
    }
    cancel() {
        if(!this.pendingColor.equals(this.selectedColor)) this.syncPartColorForSelected();
        this.pendingColor.setColor(this.selectedColor);
        this.syncPendingColor()
        this.syncSelectedColor()
        
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
        this.syncPendingColor();
        this.syncHueBar(target);
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

    oninput(event) {
        const target = event.target;
        if(!target.dataset.setColor) return;

        const color = Color.fromString(target.value);
        if(!color) return
        console.log(target.value,color);
        

        if(target.dataset.setColor ==='pendingColor') {
            this.setPendingColor(color);
        }else if(target.dataset.setColor ==='selectedColor') {
            this.setSelectedColor(color);
        }
        
        this.syncPendingColor();
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