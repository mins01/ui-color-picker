export default class UiColorPickerHueElement extends HTMLElement {
    /** @type {string} 커스텀 엘리먼트 태그명 */
    static tagName = 'ui-color-picker-hue';

    /** 커스텀 엘리먼트 등록 */
    static defineCustomElement(tagName = this.tagName) {
        if (!customElements.get(tagName)) {
            customElements.define(tagName, this);
        }
    }

    _h = 0; // hue
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
        // if (oldValue !== newValue) { this.render(); }
    }

    setColor(color) {
        const hsl = color.toHsl()
        this.h = hsl.h;
    }

    /** 감시할 속성 목록 */
    static get observedAttributes() {
        return ['data-hue'];
    }

    _getHFromEvent(event){
        return this.dataset.dir=='horizontal'
            ?(Math.max(0, Math.min(1, event.offsetX / this.offsetWidth))*360)
            :(Math.max(0, Math.min(1, event.offsetY / this.offsetHeight))*360)
    }
    _hFromDown = null
    onpointerdown(event) {
        this.setPointerCapture(event.pointerId);
        this._hFromDown = this.h;
        const h = this._getHFromEvent(event)
        if (h === this.h) return;
        this.h = h;
        this.dispatchEvent(new Event('input-hue', { bubbles: true,cancelable: true }));

    }

    onpointermove(event) {
        if (!this.hasPointerCapture(event.pointerId)) return;
        const h = this._getHFromEvent(event)
        if (h === this.h) return;
        this.h = h;
        this.dispatchEvent(new Event('input-hue', { bubbles: true,cancelable: true }));
    }

    onpointerup(event) {
        this.releasePointerCapture(event.pointerId);
        // console.log(this.h ,'===', this._hFromDown);
        if (this.h === this._hFromDown){
            this._hFromDown = null    
            return;
        } 
        this._hFromDown = null       
        this.dispatchEvent(new Event('change-hue', { bubbles: true,cancelable: true }));
    }

    onpointercancel(event) {
        return this.onpointerup(event);
    }

    [Symbol.toPrimitive](hint) {
        if (hint === 'number') return this._h;
        if (hint === 'string') return this._h.toString(10);
        return this._h;
    }

    toJSON() {
        return { h: this._h };
    }

    /** Shadow DOM 렌더링 */
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    --h: 0;
                    --h-position: calc( var(--h,0) / 360 * 100% );
                    user-select: none;
                    touch-action: none;
                    display: block;
                    min-width: 20px;
                    min-height: 20px;
                    cursor: ns-resize
                }
                :host([data-dir="horizontal"]){
                    cursor: ew-resize
                }
                :host::part(track){
                    width: 100%;
                    height: 100%;
                    position: relative;
                    overflow: hidden;
                }
                :host::part(bg){
                    pointer-events: none;
                    position: absolute;
                    inset:0px;
                    --bg-diriction: to bottom;
                    background: linear-gradient(var(--bg-diriction),
                        hsl(0,100%,50%),
                        hsl(30,100%,50%),
                        hsl(60,100%,50%),
                        hsl(90,100%,50%),
                        hsl(120,100%,50%),
                        hsl(150,100%,50%),
                        hsl(180,100%,50%),
                        hsl(210,100%,50%),
                        hsl(240,100%,50%),
                        hsl(270,100%,50%),
                        hsl(300,100%,50%),
                        hsl(330,100%,50%),
                        hsl(360,100%,50%)
                    );
                }
                :host([data-dir="horizontal"])::part(bg){
                    --bg-diriction: to right;
                }

                :host::part(hue-indicator){
                    z-index: 2;
                    position: absolute;
                    top: var(--h-position, 0%);
                    transform: translateY(-50%);
                    left: 0;
                    width: 100%;
                    height: 1%;
                    min-width: 0;
                    min-height: 4px;
                    
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: visible;
                }
                :host([data-dir="horizontal"])::part(hue-indicator){
                    flex-direction: column;
                    top: 0;
                    left: var(--h-position, 0%);
                    transform: translateX(-50%);
                    width: 1%;
                    height: 100%;
                    min-width: 4px;
                    min-height: 0;
                }
                :host::part(hue-handle){
                    --border-width: 2px;
                    width: 100%;
                    height: 100%;
                    box-sizing: content-box;
                    border: 1px solid rgba(255, 255, 255, 1);
                    border-width: var(--border-width) 0px;
                    box-shadow:0 0 0 1px rgba(0,0,0,0.75);
                }
                :host([data-dir="horizontal"])::part(hue-handle){
                    border-width: 0px var(--border-width);
                }

            </style>
            <div part="track">
                <div part="bg"></div>
                <div part="hue-indicator">
                    <div part="hue-handle"></div>
                </div>
                <slot></slot>
            </div>
        `;
    }
}
