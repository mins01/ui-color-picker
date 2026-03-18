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
        return ['red'];
    }

    /* =========================
     * getter / setter
     * ========================= */

    /** 0~255 범위 값 */
    get r() {
        return this.value * 255
    }

    set r(value) {
        let n = Number(value);
        if (isNaN(n)) n = 0;
        n = Math.max(0, Math.min(255, n)); // 0~255 제한
        this.value = n / 255;
    }

    get red() {
        return Math.round(this.r);
    }

    set red(value) {
        this.r = value;
    }

    /* =========================
     * constructor
     * ========================= */

    constructor() {
        super();
    }

    /* =========================
     * attribute
     * ========================= */

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        if (name === 'red') this.r = newValue;
    }

    /* =========================
     * public API
     * ========================= */

    // 유지: 색상 적용
    setColor(color) {
        if (!color) return;
        const rgb = color.toRgb();
        this.r = rgb.r;
    }

    // 유지: Color 객체 반환
    toColor() {
        const color = new Color();
        color.setRgba(this.r, 0, 0, 1); // Red 값만 적용, G,B=0
        return color;
    }

    /* =========================
     * internal utilities
     * ========================= */

    _syncStyle() {
        super._syncStyle();
        this.style.setProperty('--r', this.r);
    }

    /* =========================
     * primitive / serialization
     * ========================= */

    [Symbol.toPrimitive](hint) {
        if (hint === 'number') return this.r;
        if (hint === 'string') return this.r.toString(10);
        return this.r;
    }

    toJSON() {
        return { r: this.r };
    }

    /* =========================
     * 스타일 확장
     * ========================= */
    static extendedStyle = `<style>
        :host {
            --r: calc(var(--value) * 255);
        }
        :host::part(bg) {
            background: linear-gradient(var(--bg-direction),
                rgb(0,0,0),
                rgb(255,0,0)
            );
        }
        :host .default-handle {
            background-color: rgb(var(--r),0,0);
        }
    </style>`;
}