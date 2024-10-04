import { HomeAssistant } from 'frontend/src/types'
import { LovelaceCardConfig } from 'frontend/src/data/lovelace/config/card'
import { LovelaceCard, LovelaceCardEditor } from 'frontend/src/panels/lovelace/types'
import { LitElement, html, css, nothing, TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import { pushCardList } from 'src/utils/pushCardList'
import { HuiCard } from 'frontend/src/panels/lovelace/cards/hui-card'

@customElement("hana-ui-card")
export abstract class HanaUiCard<T extends HanaUiCardConfig> extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("../ui.editor/card");
        return document.createElement("hana-ui-card-editor");
    }
    public static getStubConfig(): Record<string, unknown> {
        return {
            title: "날씨",
            icon: "mdi:weather-sunny",
            card: {
                type: "weather-forecast",
                entity: "weather.forecast_jib",
                forecast_type: "daily"
            }
        };
    }

    @property({ type: String }) public title: string = ""
    @property({ type: String }) public icon: string = ""
    @property({ type: Boolean }) public isNaturalCardStyle: boolean = false
    @property({ attribute: false }) public card?: TemplateResult<1>
    
    @property({ attribute: false }) public _hass?: HomeAssistant;
    @property({ type: String }) public layout: string = "panel"
    @property({ type: Boolean }) public preview = false
    @state() protected _config?: T

    static styles = css`
    :host {
        --hana-ui-card-padding-base: calc(var(--hana-ui-padding-unit) * 3);
        --hana-ui-card-radius-base: calc(var(--hana-ui-card-padding-base) * 2);

        --hana-ui-card-background: hsl(var(--hana-ui-gray-base) 94%);
    }
    
    /* always hana-ui style */
    :host {
        --hana-ui-card-padding: var(--hana-ui-card-padding-base, 24px);
        --hana-ui-card-gap: calc(var(--hana-ui-card-padding) / 4);
        --hana-ui-card-border: var(--hana-ui-card-border-width, 1px) solid var(--divider-color);
        --hana-ui-card-radius: var(--hana-ui-card-radius-base, 12px);
    }
    /* always override style */
    :host {
        --ha-card-border-width: 0px;
        --ha-card-border-radius: calc(var(--hana-ui-card-radius) / 2);
    }
    ::-webkit-scrollbar {
        display: none;
    }
    * {
        padding: 0;
        margin: 0;
    }
    .hana-ui-card {
        display: flex;
        flex-direction: column;
        gap: calc(var(--hana-ui-card-gap) * 2);
        box-sizing: border-box;
        border-radius: var(--hana-ui-card-radius);
        border: var(--hana-ui-card-border);
        background: var(--hana-ui-card-background, var(--ha-card-background, var(--card-background-color, #FFF)));
        padding: var(--hana-ui-card-padding) 0;
    }
    .hui-wrapper {
        padding: 0 calc(var(--hana-ui-card-padding) - 16px);
    }
    h2 {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 var(--hana-ui-card-padding);
        font-size: var(--paper-font-title_-_font-size);
        font-weight: var(--paper-font-title_-_font-weight);
        line-height: var(--paper-font-title_-_line-height);
    }
    ha-icon {
        display: flex;
    }`

    constructor(){
        super()
        this.attachShadow({mode:'open'})
    }

    render() {
        const style = {
            '--ha-card-background': this.isNaturalCardStyle ? 'transparent' : 'inherit'
        }
        return html`
        <div class="hana-ui-card" style=${styleMap(style)}>
            ${this.isTitleView(this.title, this.icon)}
            ${this.isCardView(this.card)}
        </div>    
        `
    }

    private isTitleView(title?: string, icon?: string) {
        if(title || icon) {
            return html`<h2>
                <ha-icon icon="${this.icon}"></ha-icon>
                <p>${this.title}</p>
            </h2>`
         }else  {
             return nothing
         }
    }
    private isCardView(card?: TemplateResult<1>){
        if(card === undefined) {
            return nothing
        }else {
            return card
        }
    }

    setConfig(config: T) {
        this._config = config
        if (config.card) {
            this.card = this.createChildCard()
        }
        this.title = config.title || ""
        this.icon = config.icon ?? ""
    }

    getCardSize(){
        const shadowRoot = this.shadowRoot
        const cardElement = shadowRoot?.querySelector('hui-card')
        if(this.card !== undefined && cardElement) {
            return cardElement.getCardSize()
        } else {
            return 8
        }
    }

    protected update(changedProperties: any) {
        super.update(changedProperties)
        if(changedProperties.size > 0 && this._config !== undefined) {
            this.card = this.createChildCard()
        }

        if (changedProperties.has("layout")) {
            this.toggleAttribute("ispanel", this.layout === "panel")
        }
    }
    
    private createChildCard() {
        if(this._config === undefined || this._config.card === undefined || this.hass === undefined) {
            return undefined
        }else {
            return html`
                <div class=${this._config.card.type.split(':')[0] === 'custom' ? nothing : 'hui-wrapper'}>
                    <hui-card
                        .hass=${this.hass}
                        .preview=${this.preview}
                        .config=${this._config.card}>
                    </hui-card>
                </div>
            `
        }
    }

    set hass(hass: HomeAssistant){
        this._hass = hass
        this.card = this.createChildCard()
    }
    get hass() {
        return this._hass!
    }

}

export interface HanaUiCardConfig extends LovelaceCardConfig {
    title?: string
    icon?: string
    isNaturalCardStyle?: boolean
}

pushCardList({
    type: "hana-ui-card",
    name: "Hana UI Card",
    preview: true,
    documentationURL: "https://github.com/hana-io/lovelace-hana-ui-card"
})