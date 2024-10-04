import { css, CSSResultGroup, html, LitElement, nothing, render } from "lit";
import { LovelaceCardEditor } from "frontend/src/panels/lovelace/types"
import { HanaUiCard, HanaUiCardConfig } from "../ui/card"
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant } from "frontend/src/types";
import { fireEvent, HASSDomEvent } from "frontend/src/common/dom/fire_event";
import { LovelaceConfig } from "frontend/src/data/lovelace/config/types";
import { ConfigChangedEvent } from "frontend/src/panels/lovelace/editor/hui-element-editor";
import { GUIModeChangedEvent } from "frontend/src/panels/lovelace/editor/types";

const SCHEMA = [
    {
        name: "title",
        selector: { text: {} },
    },
    {
        name: "icon",
        selector: { icon: {} },
    },
    {
        name: "isNaturalCardStyle",
        selector: { boolean: {} },
    },
    {
        name: "theme",
        selector: { theme: {} }
    },
] as const

@customElement("hana-ui-card-editor")
export abstract class HanaUiCardEditor extends LitElement implements LovelaceCardEditor {

    @property({ attribute: false }) public hass?: HomeAssistant
    @property({ attribute: false }) public lovelace?: LovelaceConfig
    
    @state() public _config?: HanaUiCardConfig
    @state() protected GUImode = true
    @state() protected guiModeAvailable? = true

    setConfig(config: Readonly<HanaUiCardConfig>) {
        const recentConfig = this._config
        this._config = config
        if(recentConfig === undefined) {
            this.requestUpdate()
        }
    }
     
    static get styles(): CSSResultGroup {
        return [
            css`
            .card-selector {
                margin-top: 32px;
            }`
        ]
    }

    render() {
        if(this.hass === undefined || this._config === undefined) {
            return nothing
        }
        const wrapper = document.createElement('hana-ui-card')
        wrapper.title = "Select Card"
        wrapper.icon = "mdi:card-account-details-outline"
        wrapper.card = this.cardSelector(wrapper)

        return html`<ha-form
            .hass=${this.hass}
            .data=${this._config}
            .schema=${SCHEMA}
            @value-changed=${this.valueChanged}
        ></ha-form>
        <div class="card-selector">
            ${ wrapper }
        </div>`
    }

    protected handleCardPicked(ev: HASSDomEvent<ConfigChangedEvent<HanaUiCardConfig>>, _this: HanaUiCardEditor) {
        ev.stopPropagation();
        if (!_this._config) {
          return;
        }
        _this._config = ev.detail.config;
        fireEvent(_this, "config-changed", { config: _this._config });
    }

    private cardSelector(wrapper: HanaUiCard<HanaUiCardConfig>) {
        return html`<div style="padding: 0 var(--hana-ui-card-padding)">
            ${
                this._config?.card !== undefined
                ?
                html`<hui-card-element-editor
                    .hass=${this.hass}
                    .value=${this._config.card}
                    .lovelace=${this.lovelace}
                    @config-changed=${(ev: HASSDomEvent<ConfigChangedEvent<HanaUiCardConfig>>) => {
                        this.handleConfigChanged(ev, wrapper)
                    }}
                    @GUImode-changed=${this.handleGUIModeChanged}
                ></hui-card-element-editor>
                `
                :
                html`<hui-card-picker
                    .hass=${this.hass}
                    .lovelace=${this.lovelace}
                    @config-changed=${(ev: HASSDomEvent<ConfigChangedEvent<HanaUiCardConfig>>) => {
                        this.handleConfigChanged(ev, wrapper)
                    }}
                ></hui-card-picker>`
            }
        </div>`;
    }

    private valueChanged(ev: CustomEvent): void {
        ev.stopPropagation();
        if (!this._config || !this.hass) {
          return;
        }
    
        fireEvent(this, "config-changed", { config: ev.detail.value });
    }

    protected handleConfigChanged(ev: HASSDomEvent<ConfigChangedEvent<HanaUiCardConfig>>, wrapper: HanaUiCard<HanaUiCardConfig>) {
        ev.stopPropagation();
        if (!this._config) {
          return;
        }
        const newConfig = Object.assign({}, this._config, { card: ev.detail.config })
        this._config = newConfig;
        wrapper.card = this.cardSelector(wrapper)
        wrapper.requestUpdate()
        fireEvent(this, "config-changed", { config: this._config });
    }

    protected handleGUIModeChanged(ev: HASSDomEvent<GUIModeChangedEvent>): void {
        ev.stopPropagation();
        this.GUImode = ev.detail.guiMode;
        this.guiModeAvailable = ev.detail.guiModeAvailable;
    }
}