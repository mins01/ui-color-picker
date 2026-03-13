export default class UiColorPickerHueElement extends HTMLElement {
    /** @type {string} 커스텀 엘리먼트 태그명 */
    static tagName = 'ui-color-picker-hue';

    /** 커스텀 엘리먼트 등록 */
    static defineCustomElement(tagName = this.tagName) {
        if (!customElements.get(tagName)) {
            customElements.define(tagName, this);
        }
    }

    #h = 0; // hue

    get h() { return this.#h; }
    set h(value) { 
        this.#h = Number(value); 
        this.style.setProperty('--hue-percent', (Math.round(this.#h/360*100*100)/100)+'%');
        const attr = Math.round(this.#h);
        if (this.getAttribute('data-hue') !== attr) {
            this.setAttribute('data-hue', attr);
        }
    }

    get hue() { return Math.round(this.#h); }
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
        if (oldValue !== newValue) {
            this.render();
        }
    }

    setColor(color) {
        const hsl = color.toHsl()
        this.h = hsl.h;
    }

    /** 감시할 속성 목록 */
    static get observedAttributes() {
        return ['data-hue'];
    }

    #getHFromEvent(event){
        return this.dataset.dir=='horizontal'
            ?(Math.max(0, Math.min(1, event.offsetX / this.offsetWidth))*360)
            :(Math.max(0, Math.min(1, event.offsetY / this.offsetHeight))*360)
    }
    #hFromDown = null
    onpointerdown(event) {
        this.setPointerCapture(event.pointerId);
        this.#hFromDown = this.h;
        const h = this.#getHFromEvent(event)
        if (h === this.h) return;
        this.h = h;
        this.dispatchEvent(new Event('input-hue', { bubbles: true,cancelable: true }));

    }

    onpointermove(event) {
        if (!this.hasPointerCapture(event.pointerId)) return;
        const h = this.#getHFromEvent(event)
        if (h === this.h) return;
        this.h = h;
        this.dispatchEvent(new Event('input-hue', { bubbles: true,cancelable: true }));
    }

    onpointerup(event) {
        this.releasePointerCapture(event.pointerId);
        // console.log(this.h ,'===', this.#hFromDown);
        if (this.h === this.#hFromDown){
            this.#hFromDown = null    
            return;
        } 
        this.#hFromDown = null       
        this.dispatchEvent(new Event('change-hue', { bubbles: true,cancelable: true }));
    }

    onpointercancel(event) {
        return this.onpointerup(event);
    }

    [Symbol.toPrimitive](hint) {
        if (hint === 'number') return this.#h;
        if (hint === 'string') return this.#h.toString(10);
        return this.#h;
    }

    toJSON() {
        return { h: this.#h };
    }

    /** Shadow DOM 렌더링 */
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    --hue-percent: 0%;
                    user-select: none;
                    touch-action: none;
                    display: block;
                    min-width: 20px;
                    min-height: 20px;
                    cursor: crosshair;
                }
                :host .bg{
                    position: absolute;
                    inset:0px;
                    background: linear-gradient(to bottom,
                        hsl(0, 100%, 50%),
                        hsl(60, 100%, 50%),
                        hsl(120, 100%, 50%),
                        hsl(180, 100%, 50%),
                        hsl(240, 100%, 50%),
                        hsl(300, 100%, 50%),
                        hsl(360, 100%, 50%)
                    );
                }
                :host([data-dir="horizontal"]) .bg{
                    background: linear-gradient(to right,
                        hsl(0, 100%, 50%),
                        hsl(60, 100%, 50%),
                        hsl(120, 100%, 50%),
                        hsl(180, 100%, 50%),
                        hsl(240, 100%, 50%),
                        hsl(300, 100%, 50%),
                        hsl(360, 100%, 50%)
                    );
                }
                :host .wrap{
                    width: 100%;
                    height: 100%;
                    position: relative;
                    overflow: hidden;
                }
                :host .reference-wrap{
                    position: absolute;
                    top: var(--hue-percent,0%);
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
                :host([data-dir="horizontal"]) .reference-wrap{
                    top: 0;
                    left: var(--hue-percent,0%);
                    transform: translateX(-50%);
                    width: 1%;
                    height: 100%;
                    min-width: 4px;
                    min-height: 0;
                }
                :host .reference-line{
                    width: 100%;
                    height: 100%;
                    box-sizing: content-box;
                    border: 1px solid rgba(255, 255, 255, 0.75);
                    border-width: 2px 0px;
                    box-shadow: 0 0px 15px 1px rgba(0, 0, 0, 0.75);
                    mix-blend-mode: darken;
                }
                :host([data-dir="horizontal"]) .reference-line{
                    border-width: 0px 2px;
                }

            </style>
            <div class="wrap">
                <div class="bg">
                </div>
                <div class="reference-wrap">
                    <div class="reference-line"></div>
                </div>
                
                <slot></slot>
            </div>
        `;
    }
}
