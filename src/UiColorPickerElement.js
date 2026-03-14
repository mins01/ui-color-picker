import Color from "../third_party/js-color/v2/src/Color.js";
export default class UiColorPickerElement extends HTMLElement {
    /** @type {string} 커스텀 엘리먼트 태그명 */
    static tagName = 'ui-color-picker';

    /** 커스텀 엘리먼트 등록 */
    static defineCustomElement(tagName = this.tagName) {
        if (!customElements.get(tagName)) {
            customElements.define(tagName, this);
        }
    }

    currentColor = new Color(0,0,0,1); //현재 색
    pendingColor = new Color(0,0,0,1); //선택중인 색

    /** 생성자: Shadow DOM 초기화 */
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    /** DOM에 추가될 때 호출 */
    connectedCallback() {
        this.render();
    }

    /** DOM에서 제거될 때 호출 */
    disconnectedCallback() {
    }

    /** 속성 변경 시 호출 */
    attributeChangedCallback(name, oldValue, newValue) {
        if(oldValue === newValue) return;
        if(name=='value') this.value = newValue;
        // if (oldValue !== newValue) { this.render(); }
    }

    setColor(color) {
        this.currentColor.setColor(color);
    }
    toColor(){
        return this.currentColor.clone()
    }
    toHsl(){ return this.currentColor.toHsl(); }

    set value(value) { 
        this.currentColor.setString(value);
    }
    get value() { return this.currentColor.toRgbString(); }

    /** 감시할 속성 목록 */
    static get observedAttributes() {
        return ['value'];
    }

    
    [Symbol.toPrimitive](hint) {
        if (hint === 'number'){
            const color = this.toColor()
            return color.toRgbNumber();
        } 
        if (hint === 'string') return this.toHslString()
        return this.toHslString()
    }
    toHslString() { 
        return `hsl(${this.hue}, ${this.saturation} ${this.lightness})`;
    }
    toString(type=Color.toStringType){
        return this.currentColor.toString(type)
    }

    toColor(){
        return this.currentColor.clone()
    }

    toJSON() {
        return this.currentColor.toJSON();
    }

    /** Shadow DOM 렌더링 */
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
