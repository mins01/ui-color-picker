import Color from "../third_party/js-color/v2/src/Color.js";
import UiColorBarElement from "./UiColorBarElement.js";

export default class UiColorBarRgbGreenElement extends UiColorBarElement {

    /* =========================
     * static
     * ========================= */

    static tagName = 'ui-color-bar-rgb-green';

    /** Green 전용 이벤트 이름 */
    static inputEventName = 'input-rgb-green';
    static changeEventName = 'change-rgb-green';

    static get observedAttributes() {
        return ['green'];
    }

    /* =========================
     * getter / setter
     * ========================= */

    /** 0~255 범위 값 */
    get g() {
        return this.value * 255
    }

    set g(value) {
        let n = Number(value);
        if (isNaN(n)) n = 0;
        n = Math.max(0, Math.min(255, n)); // 0~255 제한
        this.value = n / 255;
    }

    get green() {
        return Math.round(this.g)
    }

    set green(value) {
        this.g = value;
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
        if (name === 'green') this.g = newValue;
    }

    /* =========================
     * public API
     * ========================= */

    setColor(color) {
        if (!color) return;
        const rgb = color.toRgb();
        this.g = rgb.g;
    }

    toColor() {
        const color = new Color();
        color.setRgba(0, this.g, 0, 1); // Green 값만 적용, R,B=0
        return color;
    }

    /* =========================
     * internal utilities
     * ========================= */

    _syncStyle() {
        super._syncStyle();
        this.style.setProperty('--g', this.g);
    }

    /* =========================
     * primitive / serialization
     * ========================= */

    [Symbol.toPrimitive](hint) {
        if (hint === 'number') return this.g;
        if (hint === 'string') return this.g.toString(10);
        return this.g;
    }

    toJSON() {
        return { g: this.g };
    }

    /* =========================
     * 스타일 확장
     * ========================= */
    static extendedStyle = `<style>
        :host {
            --g: calc(var(--value) * 255);
        }
        :host::part(bg) {
            background: linear-gradient(var(--bg-direction),
                rgb(0,0,0),
                rgb(0,255,0)
            );
        }
        :host .default-handle {
            background-color: rgb(0,var(--g),0);
        }
    </style>`;
}