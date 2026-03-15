import Color from "../third_party/js-color/v2/src/Color.js";

export default class UiColorSwatchesElement extends HTMLElement {

    /* =========================
     * static
     * ========================= */

    /** 커스텀 엘리먼트 태그명 */
    static tagName = 'ui-color-swatches';

    static swatchClassName ="swatch"
    static maxRecentSwatches = 10;

    /** 감시할 속성 목록 */
    static get observedAttributes() {
        return ['value'];
    }

    /** 커스텀 엘리먼트 등록 */
    static defineCustomElement(tagName = this.tagName) {
        if (!customElements.get(tagName)) {
            customElements.define(tagName, this);
            console.log('defineCustomElement', tagName);
        }
    }

    /* =========================
     * fields
     * ========================= */

    color = new Color();
    swatchClassName = UiColorSwatchesElement.swatchClassName
    maxRecentSwatches = UiColorSwatchesElement.maxRecentSwatches

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
        this.render();
    }

    disconnectedCallback() {}

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
    }

    /* =========================
     * public API
     * ========================= */
    addSwatch(color,{pinned=false,recent=true}={}){ 
        if(this.hasSwatch(color)) return;
        const swatch = window.document.createElement('ui-color');
        swatch.setColor(color);
        swatch.className = this.swatchClassName
        swatch.classList.add('swatch');
        if(pinned) swatch.classList.add('pinned');
        if(recent) swatch.classList.add('recent');

        const firstNotPinned = this.querySelector('.swatch:not(.pinned)');
        if(firstNotPinned) firstNotPinned.before(swatch);
        else this.appendChild(swatch);

        this.trimNotPinned()
        
    }
    hasSwatch(color){ // 색상 중복 금지
        const swatches = this.querySelectorAll('.swatch');
        for (const swatch of swatches) {
            if(swatch.color.equals(color)){
                return true;
            }
        }
        return false;
    }
    removeSwatch(color){ // 색상 삭제
        const swatches = this.querySelectorAll('.swatch');
        for (const swatch of swatches) {
            if(swatch.color.equals(color)){
                swatch.remove();
            }
        }
    }

    addPinned(color){ // 고정 색상 추가
        return this.addSwatch(color,{pinned:true,recent:false})
    }
    addRecent(color){ // 최근 색상 추가
        return this.addSwatch(color,{pinned:false,recent:true})
    }
    
    trimNotPinned(max=this.maxRecentSwatches){ // 최근 색상 수 제한
        const notPinneds = this.querySelectorAll('.swatch:not(.pinned)');
        if(notPinneds.length > max){
            notPinneds[notPinneds.length-1].remove();
        }
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