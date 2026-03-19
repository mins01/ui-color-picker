import Color from "../third_party/js-color/v2/src/Color.js";
import UiColorBarElement from "./UiColorBarElement.js";

export default class UiColorBarRedElement extends UiColorBarElement {

    static tagName = 'ui-color-bar-red';
    static inputEventName = 'input-red';
    static changeEventName = 'change-red';

    static get observedAttributes() {
        return ['value'];
    }

    get value() {
        return this._value
    }

    set value(value) {
        let n = Number(value);
        if (!Number.isFinite(n)) { throw new TypeError( `Failed to set the 'value' property on '${this.tagName}': The provided value is non-finite.` ); }
        n = Math.max(0, Math.min(255, n));
        this._value = n ;
        this._syncStyle();
    }

    constructor() {
        super();
    }

    setColor(color) {
        if (!color) return;
        const rgb = color.toRgb();
        this.value = rgb.r;
    }

    toColor() {
        const color = new Color();
        color.setRgba(this.value, 0, 0, 1);
        return color;
    }

    _getHFromEvent(event) {
        return this.dataset.dir === 'horizontal'
            ? (Math.max(0, Math.min(1, event.offsetX / this.offsetWidth))) * 255
            : (1-(Math.max(0, Math.min(1, event.offsetY / this.offsetHeight)))) * 255;
    }

    static prependStyle = `
        <style>
            :host {
                --value: 0;
                --value-position: calc( ( 1 - var(--value,0) / 255 )  * 100%);
            }
            :host([data-dir="horizontal"]){
                --value-position: calc( ( var(--value,0) / 255 ) * 100%);
            }
        </style>`;
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
