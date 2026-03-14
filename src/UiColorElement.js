import Color from "../third_party/js-color/v2/src/Color.js";
export default class UiColorElement extends HTMLElement {
    /** @type {string} 커스텀 엘리먼트 태그명 */
    static tagName = 'ui-color';

    /** 커스텀 엘리먼트 등록 */
    static defineCustomElement(tagName = this.tagName) {
        if (!customElements.get(tagName)) {
            customElements.define(tagName, this);
            console.log('defineCustomElement',tagName);
            
        }
    }

    
    



    color = new Color();
    
    /** 생성자: Shadow DOM 초기화 */
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.syncStyle();
    }


    /** 감시할 속성 목록 */
    static get observedAttributes() {
        return ['value'];
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
        if(name=='value'){
            this.value = newValue;
            console.log(name,newValue,this.value);
        }
        // if (oldValue !== newValue) { this.render(); }
    }

    syncStyle(){
        this.style.setProperty('--color', this.color.toRgbaString());
    }

    setColor(color) {
        this.color.setColor(color);
        this.syncStyle();
    }
    setRgba(r,g,b,a=null){ 
        this.color.setRgba(r,g,b,a);
        this.syncStyle();
    }
    

    set value(value) { 
        const color = Color.fromString(value)
        this.setColor(color);
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

    toColor(){
        return this.color.clone()
    }
    toHslString() { 
        return `hsl(${this.hue}, ${this.saturation} ${this.lightness})`;
    }
    toString(type=Color.toStringType){
        return this.color.toString(type)
    }


    toJSON() {
        return this.color.toJSON();
    }

    /** Shadow DOM 렌더링 */
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
