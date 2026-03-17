import Color from "../third_party/js-color/v2/src/Color.js";
import UiColorSwatchElement from "./UiColorSwatchElement.js";

export default class UiColorSwatchesElement extends HTMLElement {

    /* =========================
     * static
     * ========================= */

    /** 커스텀 엘리먼트 태그명 */
    static tagName = 'ui-color-swatches';

    static swatchClassName ="swatch"
    static maxlength = 10;
    static storageKey = 'ui-color-swatches';
    static autoSave = false;
    static autoLoad = false;
    

    /** 감시할 속성 목록 */
    static get observedAttributes() {
        return ['value','maxlength','storage-key','auto-save','auto-load','toggle-pin-on-dblclick'];
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

    // color = new Color();
    swatchClassName = UiColorSwatchesElement.swatchClassName
    maxlength = UiColorSwatchesElement.maxlength
    storageKey = UiColorSwatchesElement.storageKey
    togglePinOnDblclick = false

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
        if (!this.shadowRoot.firstChild){
            this.render();
            this.autoLoadStorage();
            this.renderSorted()
            this.trim()
            
        }
        this.addEventListener('dblclick',this.handleDblclick);
        this.addEventListener('click',this.handleclick);
            
    }

    disconnectedCallback() {
        this.removeEventListener('dblclick',this.handleDblclick);
        this.removeEventListener('click',this.handleclick);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        
        if(name === 'value') this.value = newValue;
        if(name === 'maxlength') {
            this.maxlength = Number(newValue);
            this.trim()
        }
        if(name === 'storage-key') { this.storageKey = newValue; }
        if(name === 'auto-save') { this.autoSave = newValue !== null && newValue !== 'false'; }
        if(name === 'auto-load') { this.autoLoad = newValue !== null && newValue !== 'false'; }
        if(name === 'toggle-pin-on-dblclick') { this.togglePinOnDblclick = newValue !== null && newValue !== 'false'; }
        
        
    }

    /* =========================
     * getter / setter
     * ========================= */

    set value(value) {
        const color = Color.fromString(value);
        this.selectColor(color);
    }

    get value() {
        return this.color?.toRgbString();
    }

    get color() {
        return this.getSelectedSwatch()?.color;
    }

    /* =========================
     * public API
     * ========================= */
    setColor(color){ // 색상 변경
        if(!color) return;
        // this.selectColor(color);
        this.addRecent(color);
    }
    selectColor(color){ // 색상 선택
        const swatches = this.querySelectorAll('.swatch');
        for (const swatch of swatches) {
            swatch.color.equals(color)?swatch.classList.add('selected'):swatch.classList.remove('selected')
        }
        
        this.dispatchEvent( new Event('select-color-swatch', { bubbles: true, cancelable: true }) );
    }
    getSelectedSwatch(){
        return this.querySelector('.swatch.selected')
    }
    toggleSwatchPin(swatch){ // 고정 색상 변경
        if(!swatch || swatch.classList.contains('locked')) return
        swatch?.classList?.toggle('pinned');
        this.renderSorted()
        this.autoSaveStorage();
        swatch.dispatchEvent(
            new Event('toggle-pin-swatch', { bubbles: true, cancelable: true })
        );
    }
    renderSorted(){ // 색상 정렬
        this.querySelectorAll('.swatch.locked').forEach(swatch=>this.append(swatch))
        this.querySelectorAll('.swatch.pinned').forEach(swatch=>this.append(swatch))
        this.querySelectorAll('.swatch:not(.locked):not(.pinned)').forEach(swatch=>this.append(swatch))
        
    }
    addSwatch(color,{locked=false,pinned=false,recent=true}={}){
        let swatch = null
        let addedSwatch = null
        if(!this.hasColor(color)){
            addedSwatch = this.createSwatch(color,{locked,pinned,recent});
            if(addedSwatch){
                const firstNotPinned = this.querySelector('.swatch:not(.pinned)');
                if(firstNotPinned) firstNotPinned.before(addedSwatch);
                else this.append(addedSwatch);   
                this.trim()
            }
        }
        this.renderSorted()
        this.selectColor(color)
        if(addedSwatch){
            addedSwatch.dispatchEvent( new Event('add-swatch', { bubbles: true, cancelable: true }) );
            this.autoSaveStorage();
        }
        return swatch;
    }
    createSwatch(color,{locked=false,pinned=false,recent=true}={}){ // 색상 생성
        const swatch = window.document.createElement(UiColorSwatchElement.tagName);
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
    
    trim(maxlength=this.maxlength){ // 최근 색상 수 제한
        const withPinneds = this.querySelectorAll('.swatch:not(.locked)');
        if(withPinneds.length > maxlength){
            const diff = withPinneds.length - maxlength;
            const recents = this.querySelectorAll('.swatch:not(.pinned):not(.locked)');
            
            if(!recents.length) return false;
            for (let i = 0; i < diff && i < recents.length; i++) {
                recents[recents.length - 1 - i].remove();
            }
        }
    }


    autoSaveStorage(){ // 자동 색상 저장
        if(!this.autoSave) return;
        this.saveStorage();
    }
    saveStorage(){ // 색상 저장
        localStorage.setItem(this.storageKey,JSON.stringify(this));
        // console.log('saveStorage',this.storageKey);
        
    }
    autoLoadStorage(){ // 자동 로드
        if(!this.autoLoad) return;
        this.loadStorage();
    }
    loadStorage(){ // 색상 로드
        let data = null
        try {
            data = JSON.parse(localStorage.getItem(this.storageKey));
        } catch (error) {
            console.error(error);
            return false;
        }
        if(!data) return false;
        const d = [];
        for (const swatch of data.swatches) {           
            const color = Color.fromColor(swatch.color);
            if(!this.hasColor(color)){
                const addedSwatch = this.createSwatch(color,{locked:swatch.locked,pinned:swatch.pinned,recent:swatch.recent});
                this.append(addedSwatch);
            }
        }
        this.renderSorted()
        this.trim()
        // console.log('loadStorage',this.storageKey);
        return true;
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
        }
        return data;
    }

    /* =========================
     * pointer events
     * ========================= */
    handleDblclick(event){
        const target = event.target.closest('.swatch');
        if(!target) return;
        if(!this.togglePinOnDblclick) return;
        this.toggleSwatchPin(target)
    }
    handleclick(event){
        const target = event.target.closest('.swatch');
        if(!target) return;
        this.selectColor(target.color)
        target.dispatchEvent( new Event('click-swatch', { bubbles: true, cancelable: true }) );
    }

    /* =========================
     * render
     * ========================= */

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    min-width: 20px;
                    min-height: 20px;
                    --border-radius: 4px;
                    display: grid;
                    /*grid-template-columns: repeat(auto-fill, minmax(var(--swatch-size,${UiColorSwatchElement.swatchSize}), 1fr)); */
                    grid-template-columns: repeat(auto-fill, minmax(var(--swatch-size,${UiColorSwatchElement.swatchSize}), auto)); 
                    gap: 4px;
                    align-items: center;
                    justify-items: center;
                    justify-content: start;
                }
            </style>
            <slot></slot>
        `;
    }
}