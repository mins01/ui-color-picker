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
    }

    /* =========================
     * lifecycle
     * ========================= */

    connectedCallback() {
        this.pendingColor.setColor(this.selectedColor);
        if (!this.shadowRoot.firstChild){
            this.render();
        }
        this.syncSelectedColor();
        this.syncPartColorForSelected();
        this.syncPendingColor();

        this.addEventListener('input-sl', this.handleInputSl);
        this.addEventListener('change-sl', this.handleChangeSl);
        this.addEventListener('input-hue', this.handleInputHue);
        this.addEventListener('change-hue', this.handleChangeHue);
        this.addEventListener('input', this.handleInput);
    }

    disconnectedCallback() {
        this.removeEventListener('input-sl', this.handleInputSl);
        this.removeEventListener('change-sl', this.handleChangeSl);
        this.removeEventListener('input-hue', this.handleInputHue);
        this.removeEventListener('change-hue', this.handleChangeHue);
        this.removeEventListener('input', this.handleInput);
    }

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
        if(!color) return;
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

    handleInputHue(event) {
        const target = event.target;

        const hsl = this.pendingColor.toHsl();
        hsl.h = target.h;

        this.pendingColor.setHsla(hsl.h, hsl.s, hsl.l);
        this.syncPendingColor();
        this.syncHueBar(target);
    }

    handleChangeHue(event) {
        return this.handleInputHue(event);
    }

    handleInputSl(event) {
        const target = event.target;

        const hsl = this.pendingColor.toHsl();
        hsl.s = target.s;
        hsl.l = target.l;

        this.pendingColor.setHsla(hsl.h, hsl.s, hsl.l);
        this.syncPendingColor();
    }

    handleChangeSl(event) {
        return this.handleInputSl(event);
    }

    handleInput(event) {
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