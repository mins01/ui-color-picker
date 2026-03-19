import Color from "../third_party/js-color/v2/src/Color.js";
import UiColorBarElement from "./UiColorBarElement.js";

export default class UiColorBarRgbRedElement extends UiColorBarElement {

    /* =========================
     * static
     * ========================= */

    static tagName = 'ui-color-bar-rgb-red';

    /** Red 전용 이벤트 이름 */
    static inputEventName = 'input-rgb-red';
    static changeEventName = 'change-rgb-red';


    static get observedAttributes() {
        return ['value'];
    }

    /* =========================
     * getter / setter
     * ========================= */

    /** 0~255 범위 값 */
    get value() {
        return this._value
    }

    set value(value) {
        let n = Number(value);
        if (!Number.isFinite(n)) { throw new TypeError( `Failed to set the 'value' property on '${this.tagName}': The provided value is non-finite.` ); }
        n = Math.max(0, Math.min(255, n)); // 0~255 제한
        this._value = n ;
        this._syncStyle();
    }

    /* =========================
     * constructor
     * ========================= */

    constructor() {
        super();
    }

    /* =========================
     * public API
     * ========================= */

    // 유지: 색상 적용
    setColor(color) {
        if (!color) return;
        const rgb = color.toRgb();
        this.value = rgb.r;
    }

    // 유지: Color 객체 반환
    toColor() {
        const color = new Color();
        color.setRgba(this.value, 0, 0, 1); // Red 값만 적용, G,B=0
        return color;
    }

    /* =========================
     * internal utilities
     * ========================= */

    _getHFromEvent(event) {
        return this.dataset.dir === 'horizontal'
            ? (Math.max(0, Math.min(1, event.offsetX / this.offsetWidth))) * 255
            : (1-(Math.max(0, Math.min(1, event.offsetY / this.offsetHeight)))) * 255; //y축은 inverse
    }




    /* =========================
     * 스타일 확장
     * ========================= */
    // 스타일 확장
    static prependStyle = `
        <style>
            :host {
                --value: 0;
                --value-position: calc( ( 1 - var(--value,0) / 255 )  * 100%);
            }
            :host([data-dir="horizontal"]){
                --value-position: calc( ( var(--value,0) / 255 ) * 100%);
            }
        </style>`; // 값 초기화 등
    static appendStyle = `
        <style>
        :host::part(bg) {
            background: linear-gradient(var(--bg-direction), rgb(0,0,0), rgb(255,0,0) );
        }
        :host .default-handle {
            background-color: rgb(var(--value),0,0);
        }
    </style>`;
}