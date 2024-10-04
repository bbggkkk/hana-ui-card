import { LovelaceCardConfig } from "frontend/src/data/lovelace/config/card";
import { LovelaceCard } from "frontend/src/panels/lovelace/types";
import { LitElement } from "lit";
import { customElement } from "lit/decorators";
import { StackConfig } from "src/config/stackConfig";

@customElement("hana-ui-v-stack")
export abstract class HanaUiVStack<T extends HanaUiVStackConfig> extends LitElement implements LovelaceCard {
    getCardSize() {
        return 1;
    }
    setConfig(config: HanaUiVStackConfig) {
        
    }
}

export interface HanaUiVStackConfig extends StackConfig {

}