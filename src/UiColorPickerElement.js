import Color from "../third_party/js-color/v2/src/Color.js";

export default class UiColorPickerElement extends HTMLElement {

    /* =========================
     * static
     * ========================= */
    static toStringType = 'rgb';

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
    // 현재 HUE
    selectedHue = 0;
    // 선택중인 HUE
    pendingHue = 0;

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
        this.setPendingColor(this.selectedColor);
        if (!this.shadowRoot.firstChild){
            this.render();
        }
        this.syncSelectedColor();
        this.syncPartColorForSelected();
        
        this.syncInputHue(this.selectedColor.toHsl().h);

        this.addEventListener('input-color', this.handleInputColorPlane);
        this.addEventListener('change-color', this.handleInputColorPlane);
        this.addEventListener('input-hue', this.handleInputHue);
        this.addEventListener('change-hue', this.handleChangeHue);
        this.addEventListener('input', this.handleInput);
        this.addEventListener('change', this.handleChange);
        this.addEventListener('click', this.handleClick);
        this.addEventListener('select-swatch', this.handleSelectSwatch);
    }

    disconnectedCallback() {
        this.removeEventListener('input-color', this.handleInputColorPlane);
        this.removeEventListener('change-color', this.handleInputColorPlane);
        this.removeEventListener('input-hue', this.handleInputHue);
        this.removeEventListener('change-hue', this.handleChangeHue);
        this.removeEventListener('input', this.handleInput);
        this.removeEventListener('change', this.handleChange);
        this.removeEventListener('click', this.handleClick);
        this.removeEventListener('select-swatch', this.handleSelectSwatch);
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
        const color = Color.fromString(value);
        if(!color) return;
        this.setColor(color);
    }

    get value() {
        // return this.selectedColor.toRgbString();
        return this.toString();
    }

    /* =========================
     * public API
     * ========================= */

    setColor(color) {
        if(!color) return;
        const { h, s, l } = color.toHsl();
        if(s > 0 && l > 0 && l < 1 ){ //무채색이 아니면
            this.selectedHue = this.pendingHue = h;           
        }
        this.setPendingColor(color)
        this.setSelectedColor(color)
    }
    setPendingColor(color,autoSync = true) {
        if(!color) return;
        this.pendingColor.setColor(color);
        if(!autoSync) return;
        this.syncPendingColor();
        this.syncPartColorForPending();
    }
    setSelectedColor(color,autoSync = true) {
        if(!color) return;
        this.selectedColor.setColor(color);
        if(!autoSync) return;
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
        this.querySelectorAll('.sync-selected-color').forEach((el) => {
            this.syncToElement(this.selectedColor,el);
        })
    }
    syncPartColorForSelected() {
        this.querySelectorAll('.sync-part-color').forEach((el) => {
            this.syncToElement(this.selectedColor,el);
            this.syncHueToElement(this.selectedHue,el);
        })
    }
    syncPendingColor() {
        this.querySelectorAll('.sync-pending-color').forEach((el) => {
            this.syncToElement(this.pendingColor,el);
        })
    }
    syncPartColorForPending(){
        this.querySelectorAll('.sync-part-color').forEach((el) => {
            this.syncToElement(this.pendingColor,el);
        })
    }


    // 입력받은 색상 변경에 대한 싱크 동작처리
    syncInputHue(hue=null) {
        this.pendingHue = hue
        this.querySelectorAll('.sync-hue').forEach((el) => {
            el.h = hue;
        })
    }

    syncToElement(color,toElement){
        if('setColor' in toElement) toElement.setColor(color);
        else if ('value' in toElement) { 
            const str = color.toString(toElement.dataset.toStringType);            
            if(toElement.value !== str) toElement.value = str;
        }
    }
    syncHueToElement(hue,toElement){
        if('setHue' in toElement) toElement.setHue(hue);
    }

    confirm() {
        const { h, s } = this.pendingColor.toHsl(true);
        if(s > 0){ //무채색이 아니면
            this.selectedHue = this.pendingHue = h;
        }else{ // 무채색이면
            this.selectedHue = this.pendingHue;
        }
        this.setSelectedColor(this.pendingColor)
        // this.syncSelectedColor()
        // this.syncPartColorForSelected();
        this.dispatchEvent(new Event('confirm-color-picker', { bubbles: true, cancelable: true }));
    }
    cancel() {
        const { h, s } = this.selectedColor.toHsl(true);
        if(s > 0){ //무채색이 아니면
            this.pendingHue = this.selectedHue = h;
        }else{ // 무채색이면
            this.pendingHue = this.selectedHue;
        }
        this.setPendingColor(this.selectedColor);
        // this.syncPendingColor();
        // this.syncSelectedColor();
        this.syncPartColorForSelected();
        
        this.dispatchEvent(new Event('cancel-color-picker', { bubbles: true, cancelable: true }));
    }


    /* =========================
     * event handlers
     * ========================= */

    
    handleInputHue(event) {
        const target = event.target;

        const hsl = this.pendingColor.toHsl();
        hsl.h = target.value;
        this.pendingHue = hsl.h;

        this.pendingColor.setHsla(hsl.h, hsl.s, hsl.l);
        this.syncPendingColor();
        
        this.syncInputHue(target.value);
    }

    handleChangeHue(event) {
        return this.handleInputHue(event);
    }

    handleInputColorPlane(event){
        const target = event.target;
        const { h, s, l } = target.color.toHsl();
        if(s > 0 && l > 0 && l < 1 ){ //무채색이 아니면
            this.pendingHue = h;           
        }
        this.setPendingColor(target.color,false) // 싱크 안함. 단방향
        this.syncPendingColor();
    }

    handleInput(event) {
        const target = event.target;
        if(!target.dataset.setColor) return;

        const color = Color.fromString(target.value);
        if(!color) return

        if(target.dataset.setColor ==='pendingColor') {
            this.setPendingColor(color);
            // this.syncPartColorForPending();
        }else if(target.dataset.setColor ==='selectedColor') {
            this.setSelectedColor(color,false);
            // this.syncPartColorForSelected();
        }
    }

    handleChange(event) {
        const target = event.target;
        if(!target.dataset.setColor) return;

        const color = Color.fromString(target.value);
        if(!color){
                if(target.dataset.setColor ==='pendingColor') {
                    this.syncPendingColor();
                }else if(target.dataset.setColor ==='selectedColor') {
                    this.syncPendingColor();
                }
        }else{
            if(target.dataset.setColor ==='pendingColor') {
                this.setPendingColor(color);            
            }else if(target.dataset.setColor ==='selectedColor') {
                this.setSelectedColor(color);
            }
        }

    }
    handleClick(event) {
        const target = event.target;
        if(!target.dataset.pickerAction) return;
        switch(target.dataset.pickerAction) {
            case 'confirm': this.confirm(); break;
            case 'cancel': this.cancel(); break;
        }
    }

    

    handleSelectSwatch(event) {
        const swatch = event.target;
        this.setPendingColor(swatch.color);        
    }

    /* =========================
     * conversion / util
     * ========================= */

    // toHslString() {
    //     return `hsl(${this.hue}, ${this.saturation} ${this.lightness})`;
    // }

    toString(type = null) {
        if(!type){ type = this.dataset.toStringType??this.constructor.toStringType; }
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