import { HomeAssistant } from 'frontend/src/types'
import { LovelaceCardConfig } from 'frontend/src/data/lovelace/config/card'
import { HuiCard } from 'frontend/src/panels/lovelace/cards/hui-card'
import { LovelaceCard, LovelaceCardEditor } from 'frontend/src/panels/lovelace/types'
import { LitElement, html, css, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { pushCardList } from 'src/utils/pushCardList'

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

    @property({ attribute: false }) public _hass?: HomeAssistant;
    @property({ type: String }) public title: string = ""
    @property({ type: String }) public icon: string = ""
    @property({ type: String }) public layout: string = "panel"
    @property({ type: Boolean }) public preview = false
    @state() public card?: HuiCard
    @state() protected _config?: T

    static styles = css`
    :host {
        --hana-ui-card-padding-base: calc(var(--hana-ui-padding-unit) * 3);
        --hana-ui-card-radius-base: calc(var(--hana-ui-card-padding-base) * 2);

        --hana-ui-card-background: hsl(var(--hana-ui-gray-base) 94%);
    }
    :host {
        --ha-card-background: hsl(var(--hana-ui-gray-base) 94%);
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
        --ha-card-border-radius: 0;
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
    }
    `

    render() {
        return html`
        <div class="hana-ui-card">
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
    private isCardView(card?: HuiCard){
        if(card === undefined) {
            return nothing
        }else {
            return html`<div class="${this.card !== undefined && this.card.tagName === "HUI-CARD" ? 'hui-wrapper' : nothing}">
                ${this.card}
            </div>`
        }
    }

    setConfig(config: T) {
        if (config.card) {
            this.card = this.createChildCard(config.card)
        //   throw new Error("You need to define an card")
        }
        this.title = config.title || ""
        this.icon = config.icon ?? ""

        this._config = config
    }

    getCardSize(){
        if(this.card !== undefined) {
            return this.card.getCardSize()
        } else {
            return 1
        }
    }

    protected update(changedProperties: any) {
        super.update(changedProperties)
        if (this.card !== undefined) {
            if(changedProperties.has('hass') && this.hass !== undefined) {
                this.updateCards(this.hass)
            }
            if (changedProperties.has("preview")) {
                this.card.preview = this.preview
            }
        }

        if (changedProperties.has("layout")) {
            this.toggleAttribute("ispanel", this.layout === "panel")
        }
    }

    private updateCards(hass: HomeAssistant) {
        if(this.card !== undefined) {
            this.card.hass = hass
        }
    }

    private createChildCard(config: LovelaceCardConfig) {
        const element = document.createElement("hui-card")
        element.hass = this.hass
        element.preview = this.preview
        element.config = config
        element.load()
        return element
    }

    set hass(hass: HomeAssistant){
        this._hass = hass
        this.updateCards(hass)
    }

    get hass() {
        return this._hass!
    }
}

export interface HanaUiCardConfig extends LovelaceCardConfig {
    title?: string
    icon?: string
}

pushCardList({
    type: "hana-ui-card",
    name: "Hana UI Card",
    preview: true,
    documentationURL: "https://github.com/hana-io/lovelace-hana-ui-card"
})