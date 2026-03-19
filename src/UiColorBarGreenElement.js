import Color from "../third_party/js-color/v2/src/Color.js";
import UiColorBarElement from "./UiColorBarElement.js";
import UiColorBarRedElement from "./UiColorBarRedElement.js";

export default class UiColorBarGreenElement extends UiColorBarRedElement {

    static tagName = 'ui-color-bar-green';
    static inputEventName = 'input-green';
    static changeEventName = 'change-green';

    constructor() {
        super();
    }

    setColor(color) {
        if(!color) return;
        const rgba = color?.toRealRgba?.()??color?.toRgba?.()?? (color && typeof color === 'object' ? color : null);
        if (!rgba || rgba.r == null || rgba.g == null || rgba.b == null) {
            throw new TypeError("Invalid Color");
        }
        this.value = rgba.g;
    }

    toColor() {
        const color = new Color();
        color.setRgba(0, this.value, 0, 1);
        return color;
    }

    static appendStyle = `<style>
        :host::part(bg) {
            background: linear-gradient(var(--bg-direction), rgb(0,0,0), rgb(0,255,0) );
        }
        :host .default-handle {
            background-color: rgb(0,var(--value),0);
        }
    </style>`;
}
