import Color from "../third_party/js-color/v2/src/Color.js";
import UiColorBarElement from "./UiColorBarElement.js";

export default class UiColorHueBarElement extends UiColorBarElement {

    /* =========================
     * static
     * ========================= */

    static tagName = 'ui-color-hue-bar';

    /** Hue 전용 이벤트 이름 */
    static inputEventName = 'input-hue';
    static changeEventName = 'change-hue';

    static get observedAttributes() {
        return ['hue'];
    }

    /* =========================
     * getter / setter
     * ========================= */

    get h() {
        return this.value * 360;
    }

    set h(value) {
        let n = Number(value);
        if (isNaN(n)) n = 0;
        n = Math.max(0, Math.min(360, n)); // 0~360 제한
        this.value = n / 360;
    }

    get hue() {
        return Math.round(this.h);
    }

    set hue(value) {
        this.h = value;
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
        if (name === 'hue') { this.h = newValue; }
    }

    /* =========================
     * public API
     * ========================= */

    // 유지: 색상 적용
    setColor(color) {
        if (!color) return;
        const hsl = color.toHsl();
        this.h = hsl.h;
    }

    // 유지: Color 객체 반환
    toColor() {
        const color = new Color();
        color.setHsla(this.h, 1, 0.5);
        return color;
    }

    /* =========================
     * internal utilities
     * ========================= */

    _syncStyle() {
        super._syncStyle();
        this.style.setProperty('--h', this.h);
    }

    /* =========================
     * primitive / serialization
     * ========================= */

    [Symbol.toPrimitive](hint) {
        if (hint === 'number') return this.h;
        if (hint === 'string') return this.h.toString(10);
        return this.h;
    }

    toJSON() {
        return { h: this.h };
    }

    /* =========================
     * 스타일 확장
     * ========================= */
    static extendedStyle = `<style>
        :host {
            --h: calc(var(--value) * 360);
        }
        :host::part(bg){
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
            background-color:hsl(var(--h),100%,50%);
        }
    </style>`;
}