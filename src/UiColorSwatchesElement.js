import Color from "../third_party/js-color/v2/src/Color.js";

export default class UiColorSwatchesElement extends HTMLElement {

    /* =========================
     * static
     * ========================= */

    /** 커스텀 엘리먼트 태그명 */
    static tagName = 'ui-color-swatches';

    static swatchClassName ="swatch"
    static maxRecentSwatches = 10;
    static storageKey = 'ui-color-swatches';

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
    storageKey = UiColorSwatchesElement.storageKey

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
        this.renderSorted()
    }

    disconnectedCallback() {}

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
    }

    /* =========================
     * public API
     * ========================= */
    selectColor(color){ // 색상 선택
        const swatches = this.querySelectorAll('.swatch');
        for (const swatch of swatches) {
            swatch.color.equals(color)?swatch.classList.add('selected'):swatch.classList.remove('selected')
        }
    }
    getSelectedSwatch(){
        return this.querySelector('.swatch.selected')
    }
    togglePinSwatch(swatch){ // 고정 색상 변경
        if(!swatch || swatch.classList.contains('locked')) return
        swatch?.classList?.toggle('pinned');
        this.renderSorted()
    }
    renderSorted(){ // 색상 정렬
        this.querySelectorAll('.swatch.locked').forEach(swatch=>this.append(swatch))
        this.querySelectorAll('.swatch.pinned').forEach(swatch=>this.append(swatch))
        this.querySelectorAll('.swatch:not(.locked):not(.pinned)').forEach(swatch=>this.append(swatch))
        
    }
    addSwatch(color,{locked=false,pinned=false,recent=true}={},autoSelected=true){
        let swatch = null
        if(!this.hasColor(color)){
            swatch = this.createSwatch(color,{locked,pinned,recent});
            if(swatch){
                const firstNotPinned = this.querySelector('.swatch:not(.pinned)');
                if(firstNotPinned) firstNotPinned.before(swatch);
                else this.append(swatch);   
                this.trimNotLocked()
            }
   
        }
        if(autoSelected) this.selectColor(color)
        this.renderSorted()
        return swatch;
    }
    createSwatch(color,{locked=false,pinned=false,recent=true}={}){ // 색상 생성
        const swatch = window.document.createElement('ui-color');
        swatch.setColor(color);
        swatch.className = this.swatchClassName
        swatch.classList.add('swatch');
        if(locked) swatch.classList.add('locked');
        if(pinned) swatch.classList.add('pinned');
        // if(recent) swatch.classList.add('recent');
        return swatch;

    }
    clearSwatches(){ // 색상 삭제
        const swatches = this.querySelectorAll('.swatch:not(.locked)');
        for (const swatch of swatches) {
            swatch.remove();
        }
    }

    hasColor(color){ // 색상 중복 금지
        const swatches = this.querySelectorAll('.swatch');
        for (const swatch of swatches) {
            if(swatch.color.equals(color)){
                return true;
            }
        }
        return false;
    }
    removeColor(color){ // 색상 삭제
        const swatches = this.querySelectorAll('.swatch');
        for (const swatch of swatches) {
            if(swatch.color.equals(color)){
                swatch.remove();
            }
        }
    }

    addlocked(color){ // 고정 색상 추가
        return this.addSwatch(color,{locked:true,pinned:false,recent:false})
    }
    addPinned(color){ // 사용자 고정 색상 추가
        return this.addSwatch(color,{locked:false,pinned:true,recent:false})
    }
    
    addRecent(color){ // 최근 색상 추가
        return this.addSwatch(color,{locked:false,pinned:false,recent:true})
    }
    
    trimNotLocked(max=this.maxRecentSwatches){ // 최근 색상 수 제한
        const withPinneds = this.querySelectorAll('.swatch:not(.locked)');
        if(withPinneds.length > max){
            const diff = withPinneds.length - max;
            const recents = this.querySelectorAll('.swatch:not(.pinned):not(.locked)');
            console.log(recents,max);
            
            if(!recents.length) return false;
            for (let i = 0; i < diff && i < recents.length; i++) {
                recents[recents.length - 1 - i].remove();
            }
        }
    }


    saveStorage(){ // 색상 저장
        localStorage.setItem(this.storageKey,JSON.stringify(this));
    }
    loadStorage(){ // 색상 로드
        const data = JSON.parse(localStorage.getItem(this.storageKey));
        if(!data) return;
        const d = [];
        for (const swatch of data.swatches) {           
            const color = Color.fromColor(swatch.color);
            if(!this.hasColor(color)){
                const addedSwatch = this.createSwatch(color,{locked:swatch.locked,pinned:swatch.pinned,recent:swatch.recent});
                this.append(addedSwatch);
            }
        }
        this.renderSorted()
        this.trimNotLocked()
    }
    toJSON(){
        const data = {swatches:[]}
        const swatches = this.querySelectorAll('.swatch');
        for (const swatch of swatches) {
            if(swatch.classList.contains('locked')) continue;
            data.swatches.push({
                locked:swatch.classList.contains('locked'),
                pinned:swatch.classList.contains('pinned'),
                recent:swatch.classList.contains('recent'),
                color:swatch.color.clone()
            });
            console.log(swatch.color.toString());
        }
        return data;
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