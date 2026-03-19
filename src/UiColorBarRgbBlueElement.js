import Color from "../third_party/js-color/v2/src/Color.js";
import UiColorBarElement from "./UiColorBarElement.js";
import UiColorBarRgbRedElement from "./UiColorBarRgbRedElement.js";
export default class UiColorBarRgbBlueElement extends UiColorBarRgbRedElement {

    /* =========================
     * static
     * ========================= */

    static tagName = 'ui-color-bar-rgb-blue';

    /** Red 전용 이벤트 이름 */
    static inputEventName = 'input-rgb-blue';
    static changeEventName = 'change-rgb-blue';


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
        this.value = rgb.g;
    }

    // 유지: Color 객체 반환
    toColor() {
        const color = new Color();
        color.setRgba(0,0,this.value,  1); // Blue 값만 적용
        return color;
    }

    /* =========================
     * 스타일 확장
     * ========================= */
    // 스타일 확장
    static appendStyle = `<style>
        :host::part(bg) {
            background: linear-gradient(var(--bg-direction), rgb(0,0,0), rgb(0,0,255) );
        }
        :host .default-handle {
            background-color: rgb(0,0,var(--value));
        }
    </style>`;
}