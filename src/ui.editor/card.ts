import { html, LitElement } from "lit";
import { LovelaceCardEditor } from "frontend/src/panels/lovelace/types"
import { HanaUiCardConfig } from "../ui/card"
import { customElement } from "lit/decorators.js";

@customElement("hana-ui-card-editor")
export abstract class HanaUiCardEditor extends LitElement implements LovelaceCardEditor {
    setConfig(config: Readonly<HanaUiCardConfig>) {
        console.log(config)
    }
    render() {
        return html`hi`
    }
}