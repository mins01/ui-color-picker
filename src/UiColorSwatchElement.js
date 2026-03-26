import UiColorElement from "./UiColorElement.js";

// ui-color 의 확장형, 클래스정의에 따른 ::befor,::after 제어
export default class UiColorSwatchElement extends UiColorElement {

    /* =========================
     * static
     * ========================= */

    /** 커스텀 엘리먼트 태그명 */
    static tagName = 'ui-color-swatch';

    static swatchSize = '32px';

    /* =========================
     * constructor
     * ========================= */

    constructor() {
        super();
    }


    /* =========================
     * render
     * ========================= */

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host{
                    --color: rgb(0, 0, 0);
                    display: block;
                    min-width: 20px;
                    min-height: 20px;
                    font-size: calc( var(--swatch-size,${UiColorSwatchElement.swatchSize}) / 2 );
                    width: calc( var(--swatch-size,${UiColorSwatchElement.swatchSize}));
                    height: calc( var(--swatch-size,${UiColorSwatchElement.swatchSize}));
                    border-radius: var(--border-radius,0px);
                    user-select: none;
                    position: relative;
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border: 1px solid #ccc;

                    background-color: var(--color);
                }
                :host::after{
                    font-size: 0.8em;
                    position: absolute;
                    inset: 0;
                    display: flex;
                    justify-content: flex-end;
                    align-items: flex-end;
                }
                :host(.locked)::after{
                    content: '🔒';
                }
                :host(.pinned)::after{
                    content: '📌';           
                }
                :host(.selected){
                        border-color:#000;
                    box-shadow:inset 0 0 0 1px #fff;
                }
                :host(.selected)::before{
                    position: absolute;
                    inset: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    content: '✔️';
                    
                }
                    
            </style>
            <slot></slot>
        `;
    }
}