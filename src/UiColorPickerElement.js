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

    /** @type {Color} 현재 색 */
    color = new Color(0,0,0,1); //현재 색

    /** @type {Color} 선택중인 색 */
    pendingColor = new Color(0,0,0,1); //선택중인 색

    /** 생성자: Shadow DOM 초기화 */
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.addEventListener('input-sl', this.oninputSl.bind(this));
        this.addEventListener('change-sl', this.onchangeSl.bind(this));
        this.addEventListener('input-hue', this.oninputHue.bind(this));
        this.addEventListener('change-hue', this.onchangeHue.bind(this));
    }

    oninputHue(event){
        const target = event.target;
        const hsl = this.pendingColor.toHsl();
        hsl.h = target.h;
        this.pendingColor.setHsla(hsl.h, hsl.s, hsl.l);
        console.log(event.type,this.pendingColor.toRgbString(),this.pendingColor.toHslString());
    }
    onchangeHue(event){
        return this.oninputHue(event);
    }
    oninputSl(event){
        const target = event.target;
        const hsl = this.pendingColor.toHsl();
        hsl.s = target.s;
        hsl.l = target.l;
        this.pendingColor.setHsla(hsl.h, hsl.s, hsl.l);
        console.log(event.type,this.pendingColor.toRgbString(),this.pendingColor.toHslString());
        
    }
    onchangeSl(event){
        return this.oninputSl(event);
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
        this.color.setColor(color);
    }
    toColor(){
        return this.color.clone()
    }
    toHsl(){ return this.color.toHsl(); }


    

    set value(value) { 
        this.color.setString(value);
    }
    get value() { return this.color.toRgbString(); }

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
        return this.color.toString(type)
    }

    toColor(){
        return this.color.clone()
    }

    toJSON() {
        return this.color.toJSON();
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
