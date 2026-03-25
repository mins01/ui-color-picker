import Color from "../third_party/js-color/v2/src/Color.js";
import UiColorBarElement from "./UiColorBarElement.js";

export default class UiColorBarHueElement extends UiColorBarElement {

    /* =========================
     * static
     * ========================= */

    static tagName = 'ui-color-bar-hue';

    /** Hue 전용 이벤트 이름 */
    static inputEventName = 'input-hue';
    static changeEventName = 'change-hue';

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
        n = Math.max(0, Math.min(360, n)); // 0~360 제한
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
        if(!color) return;
        const { h, s, l } = color.toHsl();
        if(s < 0.005){
            // 무채색이면 무시
        }else{
            this.value = h;
        }
    }

    // 유지: Color 객체 반환
    toColor() {
        const color = new Color();
        color.setHsla(this.value, 1, 0.5);
        return color;
    }

    /* =========================
     * internal utilities
     * ========================= */
    _getHFromEvent(event) {
        return this.dataset.dir === 'horizontal'
            ? (Math.max(0, Math.min(1, event.offsetX / this.offsetWidth))) * 360
            : (Math.max(0, Math.min(1, event.offsetY / this.offsetHeight))) * 360; // hue는 y축은 inverse 하지 않는다.
    }



    /* =========================
     * 스타일 확장
     * ========================= */
    static prependStyle = `
        <style>
            :host {
                --value: 0;
                --value-position: calc( ( var(--value,0) / 360 )  * 100%);
            }
            :host([data-dir="horizontal"]){
                --value-position: calc( ( var(--value,0) / 360 ) * 100%);
            }
        </style>`; // 값 초기화 등
    static appendStyle = `<style>
        :host::part(bg){
            --bg-direction: to bottom;
            background: linear-gradient(var(--bg-direction),
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
        :host .default-handle{
            background-color:hsl(var(--value),100%,50%);
        }
    </style>`;
}