export class UiColorPickerHueElement extends HTMLElement {
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
        this.#h = value; 
        this.style.setProperty('--hue', value); 
    }
    
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
        if (oldValue !== newValue) {
            this.render();
        }
    }

    /** 감시할 속성 목록 */
    static get observedAttributes() {
        return [];
    }

    onpointerdown(event) {
        this.setPointerCapture(event.pointerId);
        this.h = Math.max(0, Math.min(1, event.offsetY / this.offsetHeight));
    }

    onpointermove(event) {
        if (!this.hasPointerCapture(event.pointerId)) return;
        this.h = Math.max(0, Math.min(1, event.offsetY / this.offsetHeight));
    }

    onpointerup(event) {
        this.releasePointerCapture(event.pointerId);
        this.h = Math.max(0, Math.min(1, event.offsetY / this.offsetHeight));
    }

    onpointercancel(event) {
        this.releasePointerCapture(event.pointerId);
        this.h = Math.max(0, Math.min(1, event.offsetY / this.offsetHeight));
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
                    display: block;
                    min-width: 20px;
                    min-height: 20px;
                    background: linear-gradient(to bottom,
                        hsl(0, 100%, 50%),
                        hsl(60, 100%, 50%),
                        hsl(120, 100%, 50%),
                        hsl(180, 100%, 50%),
                        hsl(240, 100%, 50%),
                        hsl(300, 100%, 50%),
                        hsl(360, 100%, 50%)
                    );
                    cursor: crosshair;
                }
            </style>
            <div class="wrap"><slot></slot></div>
        `;
    }
}
