import Color from "../third_party/js-color/v2/src/Color.js";
import UiColorWheelElement from "./UiColorWheelElement.js";

export default class UiColorWheelHueElement extends UiColorWheelElement {

    /* =========================
     * static
     * ========================= */

    static tagName = 'ui-color-wheel-hue';

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
        if(s===0 || l===0 || s===0){
            // hue가 사리지는 경우
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
        return super._getHFromEvent(event)*360;
    }



    /* =========================
     * 스타일 확장
     * ========================= */
    static prependStyle = `<style>
                :host {
                    --value: 0;
                    --value-rotation: calc(var(--value, 0) * 1deg);
                    --inner-ratio: 0.8;
                }
            </style>`; // 값 초기화 등
    static appendStyle = `<style>
        :host::part(outer-circle) {
            background: conic-gradient(
                hsl(0 100% 50%) 0deg,
                hsl(60 100% 50%) 60deg,
                hsl(120 100% 50%) 120deg,
                hsl(180 100% 50%) 180deg,
                hsl(240 100% 50%) 240deg,
                hsl(300 100% 50%) 300deg,
                hsl(360 100% 50%) 360deg
            );
        }
        :host .default-handle{
            background-color:hsl(var(--value),100%,50%);
        }
    </style>`;
}