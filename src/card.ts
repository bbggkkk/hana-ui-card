import { HomeAssistant } from 'frontend'
import { LovelaceCardConfig } from 'frontend/src/data/lovelace/config/card'
import { HuiCard } from 'frontend/src/panels/lovelace/cards/hui-card'
import { StackCardConfig } from 'frontend/src/panels/lovelace/cards/types'
import { LovelaceCard } from 'frontend/src/panels/lovelace/types'
import { LitElement, html, css } from 'lit'
import { html as staticHtml, literal } from 'lit/static-html.js';
import { customElement, property, state } from 'lit/decorators.js'

type HanaCardConfig = {
    type: "custom:hana-card"
    title: string
    icon?: string
    cards?: LovelaceCardConfig[]
}

export interface HanaCard {
    shadowRoot: ShadowRoot
}

@customElement("hana-ui-card")
export abstract class HanaCard<T extends StackCardConfig = StackCardConfig> extends LitElement implements LovelaceCard {

    @property({ attribute: false }) public _hass?: HomeAssistant;
    @property({ type: String }) public title: string = ""
    @property({ type: String }) public icon: string = ""
    @property({ type: String }) public layout: string = "panel"
    @property({ type: Boolean }) public preview = false
    @state() public cards: HuiCard[] = []
    @state() protected config?: T

    static styles = css`
    :host {
        --hana-ui-card-padding: 24px;
        --hana-ui-card-gap: calc(var(--hana-ui-card-padding) / 4);
        --hana-ui-card-radius: calc(var(--hana-ui-card-padding) * 2);

        --hana-ui-card-background: hsl(var(--hana-ui-gray-base) 94%);
    }
    :host {
        --ha-card-background: hsl(var(--hana-ui-gray-base) 98%);
        --ha-card-box-shadow: 0 0 0 hsl(var(--hana-ui-gray-base) 90%);

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
        padding: var(--hana-ui-card-padding);
        box-sizing: border-box;
        border-radius: var(--hana-ui-card-radius);
        background: var(--hana-ui-card-background, var(--ha-card-background, var(--card-background-color, #FFF)));
    }
    h2 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: calc(var(--hana-ui-card-gap) * 2);
        font-size: var(--paper-font-title_-_font-size);
        font-weight: var(--paper-font-title_-_font-weight);
        line-height: var(--paper-font-title_-_line-height);
    }
    ul {
        display: grid;
        grid-template-columns: 100%;
        gap: var(--hana-ui-card-gap);
        list-style: none;
    }
    /* li {
        transition: all .3s;
    }
    li:hover {
        transform: translateY(-2px);
        --ha-card-background: hsl(var(--hana-ui-gray-base) 100%);
        --ha-card-box-shadow: 0 4px 0 hsl(var(--hana-ui-gray-base) 64%);
    } */
    ha-icon {
        display: flex;
    }
    `

    render() {
        return html`
        <div class="hana-ui-card">
            <h2>
                <ha-icon icon="${this.icon}"></ha-icon>
                <p>${this.title}</p>
            </h2>
            <ul>
                ${this.cards.map(element => html`<li>${element}</li>`)}
            </ul>
        </div>    
        `
    }

    setConfig(config: T) {
        if (!config.cards) {
          throw new Error("You need to define an cards")
        }
        if(!config.title) {
            throw new Error("You need to define an title")
        }
        this.title = config.title
        this.icon = config.icon ?? "mdi:air-filter"
        this.cards = config.cards?.map(config => {
            return this.createChildCard(config)
        }) || []

        this.config = config
    }

    getCardSize(){
        const promises = this.cards.map(card => customElements.whenDefined(card.tagName.toLocaleLowerCase()).then(() => {
            return card.getCardSize()
        }))
        return Promise.all(promises).then((sizes) => {
            return sizes.reduce((acc, size) => acc+=size, 0)
        })
    }

    protected update(changedProperties: any) {
        super.update(changedProperties)
        if (this.cards.length > 0) {
            if(changedProperties.has('hass') && this.hass !== undefined) {
                this.updateCards(this.hass)
            }
            if (changedProperties.has("preview")) {
                this.cards.forEach((card) => {
                    card.preview = this.preview
                })
            }
        }

        if (changedProperties.has("layout")) {
            this.toggleAttribute("ispanel", this.layout === "panel")
        }
    }

    private updateCards(hass: HomeAssistant) {
        this.cards.forEach((card) => {
            card.hass = hass
        })
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