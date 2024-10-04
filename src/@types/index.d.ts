import { HanaUiCardEditor } from "src/ui.editor/card";
import { HanaUiCard } from "src/ui/card";

export {}
declare global {
  interface Window {
      customCards: any;
  }

  interface HTMLElementTagNameMap {
    'hana-ui-card': HanaUiCard;
    'hana-ui-card-editor': HanaUiCardEditor;
  }
}