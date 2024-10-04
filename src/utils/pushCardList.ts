import { TemplateResult } from "lit"

export type CardDescription = {
    type: keyof HTMLElementTagNameMap
    name: string
    preview: boolean
    description: string|HTMLElement|TemplateResult<1>
    documentationURL: string // Adds a help link in the frontend card editor
}
export function pushCardList({
    type, 
    name = '', 
    preview = false, 
    description = '', 
    documentationURL = ''
}: CardDescription) {
    window.customCards = window.customCards || []
    window.customCards.push({
        type,
        name,
        preview,
        description,
        documentationURL
    })
}