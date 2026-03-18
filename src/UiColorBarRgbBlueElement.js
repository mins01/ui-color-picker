import Color from "../third_party/js-color/v2/src/Color.js";
import UiColorBarElement from "./UiColorBarElement.js";

export default class UiColorBarRgbBlueElement extends UiColorBarElement {

    /* =========================
     * static
     * ========================= */

    static tagName = 'ui-color-bar-rgb-blue';

    /** Blue 전용 이벤트 이름 */
    static inputEventName = 'input-rgb-blue';
    static changeEventName = 'change-rgb-blue';

    static get observedAttributes() {
        return ['blue'];
    }

    /* =========================
     * getter / setter
     * ========================= */

    /** 0~255 범위 값 */
    get b() {
        return this.value * 255
    }

    set b(value) {
        let n = Number(value);
        if (isNaN(n)) n = 0;
        n = Math.max(0, Math.min(255, n)); // 0~255 제한
        this.value = n / 255;
    }

    get blue() {
        return Math.round(this.b);
    }

    set blue(value) {
        this.b = value;
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
        if (name === 'blue') this.b = newValue;
    }

    /* =========================
     * public API
     * ========================= */

    setColor(color) {
        if (!color) return;
        const rgb = color.toRgb();
        this.b = rgb.b;
    }

    toColor() {
        const color = new Color();
        color.setRgba(0, 0, this.b, 1); // Blue 값만 적용, R,G=0
        return color;
    }

    /* =========================
     * internal utilities
     * ========================= */

    _syncStyle() {
        super._syncStyle();
        this.style.setProperty('--b', this.b);
    }

    /* =========================
     * primitive / serialization
     * ========================= */

    [Symbol.toPrimitive](hint) {
        if (hint === 'number') return this.b;
        if (hint === 'string') return this.b.toString(10);
        return this.b;
    }

    toJSON() {
        return { b: this.b };
    }

    /* =========================
     * 스타일 확장
     * ========================= */
    static extendedStyle = `<style>
        :host {
            --b: calc(var(--value) * 255);
        }
        :host::part(bg) {
            background: linear-gradient(var(--bg-direction),
                rgb(0,0,0),
                rgb(0,0,255)
            );
        }
        :host .default-handle {
            background-color: rgb(0,0,var(--b));
        }
    </style>`;
}