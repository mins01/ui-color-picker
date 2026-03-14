// import UiColorPickerHueElement from "./UiColorPickerHueElement.js";
import Color from "../third_party/js-color/v2/src/Color.js";
export default class UiColorSlPlaneElement extends HTMLElement {
    /** @type {string} 커스텀 엘리먼트 태그명 */
    static tagName = 'ui-color-sl-plane';

    /** 커스텀 엘리먼트 등록 */
    static defineCustomElement(tagName = this.tagName) {
        if (!customElements.get(tagName)) {
            customElements.define(tagName, this);
        }
    }





    _h = 0; // hue (0~360)
    get h() { return this._h; }
    set h(value) { 
        this._h = Number(value); 
        this.style.setProperty('--h', this._h);
        const attr = Math.round(this._h);
        if (this.getAttribute('data-hue') !== attr) {
            this.setAttribute('data-hue', attr);
        }
    }

    get hue() { return Math.round(this._h); }
    set hue(value) { this.h = value; }

    _s = 0; // saturation (0~1)
    get s() { return this._s; }
    set s(value) {
        if (typeof value === 'string' && value.endsWith('%')) {
            value = parseFloat(value) / 100; // 0~1 범위로 변환
        } else {
            value = Number(value); // 숫자형은 그대로
        }
        this._s = Math.max(0, Math.min(1, value)); // 0~1 clamp      

        this.style.setProperty('--s', this._s);
        const attr = this.saturation
        if (this.getAttribute('data-saturation') !== attr) {
            this.setAttribute('data-saturation', attr);
        }
    }
    get saturation() { return (this._s*100).toFixed(2).replace(/\.?0+$/, '')+'%'; }
    set saturation(value) { this.s = value; }


    _l = 0; // lightness (0~1)
    get l() { return this._l; }
    set l(value) {
        if (typeof value === 'string' && value.endsWith('%')) {
            value = parseFloat(value) / 100; // 0~1 범위로 변환
        } else {
            value = Number(value); // 숫자형은 그대로
        }
        
        this._l = Math.max(0, Math.min(1, value)); // 0~1 clamp

        this.style.setProperty('--l', this._l);
        const attr = this.lightness

        if (this.getAttribute('data-lightness') !== attr) {
            this.setAttribute('data-lightness', attr);
        }
    }
    get lightness() { return (this._l*100).toFixed(2).replace(/\.?0+$/, '')+'%'; }
    set lightness(value) { this.l = value; }


    /** 생성자: Shadow DOM 초기화 */
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.addEventListener('pointerdown', this.onpointerdown.bind(this));
        this.addEventListener('pointermove', this.onpointermove.bind(this));
        this.addEventListener('pointerup', this.onpointerup.bind(this));
        this.addEventListener('pointercancel', this.onpointercancel.bind(this));
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
        if(name=='data-hue') this.h = Number(newValue);
        if(name=='data-saturation') this.s = newValue;
        if(name=='data-lightness') this.l = newValue;
        // if (oldValue !== newValue) { this.render(); }
    }

    setColor(color) {
        const hsl = color.toHsl()
        this.h = hsl.h;
        this.s = hsl.s;
        this.l = hsl.l;
    }
    toColor(){
        const color = new Color()
        color.setHsla(this.h, this.s, this.l);
        return color;
    }
    toHsl(){ return {h: this.h, s: this.s, l: this.l}; }

    /** 감시할 속성 목록 */
    static get observedAttributes() {
        return ['data-hue', 'data-saturation', 'data-lightness'];
    }

    #getSLFromEvent(event){
        return {
            s:Math.max(0, Math.min(1, event.offsetX / this.offsetWidth)),
            l:1-Math.max(0, Math.min(1, event.offsetY / this.offsetHeight))
        }
    }
    _sFromDown = null
    _lFromDown = null
    onpointerdown(event) {
        this.setPointerCapture(event.pointerId);
        this._sFromDown = this.s;
        this._lFromDown = this.l;
        const {s,l} = this.#getSLFromEvent(event)
        console.log(s,l);
        
        if (s === this.s && l === this.l) return;
        this.s = s;
        this.l = l;
        this.dispatchEvent(new Event('input-sl', { bubbles: true,cancelable: true }));

    }

    onpointermove(event) {
        if (!this.hasPointerCapture(event.pointerId)) return;
        const {s,l} = this.#getSLFromEvent(event)
        if (s === this.s && l === this.l) return;
        this.s = s;
        this.l = l;
        this.dispatchEvent(new Event('input-sl', { bubbles: true,cancelable: true }));
    }

    onpointerup(event) {
        this.releasePointerCapture(event.pointerId);
        // console.log(this.h ,'===', this._sFromDown);
        if (this.s === this._sFromDown && this.l === this._lFromDown){
            this._sFromDown = null
            this._lFromDown = null
            return;
        }
        this._sFromDown = null
        this._lFromDown = null
        this.dispatchEvent(new Event('change-sl', { bubbles: true,cancelable: true }));
    }

    onpointercancel(event) {
        return this.onpointerup(event);
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
    toString(){
        return this.toHslString()
    }

    toColor(){
        const color = new Color()
        color.setHsla(this.h, this.s, this.l);
        return color;
    }

    toJSON() {
        return { s: this._s, l: this._l };
    }

    /** Shadow DOM 렌더링 */
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    --h: 0;
                    --s: 0;
                    --l: 0;
                    --hue: calc( var(--h,0) * 1deg );
                    --h-percent: calc( var(--h,0) / 360 * 100% );
                    --s-percent: calc( var(--s,0) * 100% );
                    --l-percent: calc( ( 1 - var(--l,0) ) * 100% );
                    user-select: none;
                    touch-action: none;
                    display: block;
                    min-width: 20px;
                    min-height: 20px;
                    cursor: crosshair;
                }
                :host .wrap{
                    width: 100%;
                    height: 100%;
                    position: relative;
                    overflow: hidden;
                }
                :host .bg{
                    pointer-events: none;
                    position: absolute;
                    inset:0px;

                    /*background:
                    linear-gradient(to top, black, transparent),
                    linear-gradient(to right, white, hsl(var(--hue,0), 100%, 50%));*/
                    background:linear-gradient(to bottom, hsl(0, 0%, 100%) 0%, hsla(0, 0%, 100%, 0) 50%, hsla(0, 0%, 0%, 0) 50%, hsl(0, 0%, 0%) 100%),
	                linear-gradient(to right, hsla(0, 0%, 50%, 1) 0%, hsla(0, 0%, 50%, 0) 100%),
                    hsl(var(--hue,0) 100% 50%);
                }


                :host .saturation-reference-wrap , :host .lightness-reference-wrap{
                    position: absolute;
                    top: var(--l-percent, 0%);
                    transform: translateY(-50%);
                    left: 0;
                    width: 100%;
                    height: 4px;
                    min-width: 0;
                    min-height: 4px;
                    
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: visible;
                    box-sizing: content-box;
                }
                :host .lightness-reference-wrap{
                    flex-direction: column;
                    top: 0;
                    left: var(--s-percent, 0%);
                    transform: translateX(-50%);
                    width: 4px;
                    height: 100%;
                    min-width: 4px;
                    min-height: 0;
                }
                :host .saturation-reference-line, :host .lightness-reference-line{
                    width: 100%;
                    height: 100%;
                    box-sizing: content-box;
                    border: 1px solid rgba(255, 255, 255, 0.75);
                    border-width: 2px 0px;
                    box-shadow: 0 0px 15px 1px rgba(0, 0, 0, 0.75);
                    mix-blend-mode: darken;
                }
                :host .lightness-reference-line{
                    border-width: 0px 2px;
                }

            </style>
            <div class="wrap">
                <div class="bg">
                </div>
                
                <div class="saturation-reference-wrap">
                    <div class="saturation-reference-line"></div>
                </div>
                <div class="lightness-reference-wrap">
                    <div class="lightness-reference-line"></div>
                </div>

                <slot></slot>
            </div>
        `;
    }
}
