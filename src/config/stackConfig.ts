import { LovelaceCardConfig } from "frontend/src/data/lovelace/config/card";

export interface StackConfig extends LovelaceCardConfig {
    title?: string
    icon?: string
    cards: LovelaceCardConfig
}