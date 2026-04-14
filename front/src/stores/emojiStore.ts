import { StateCreator } from 'zustand'
import type { BoundStore } from './storeTypes'
import { getCommunicationInfo, apiGet } from './api'

export interface Emoji {
    categories: Category[]
    emojis:     { [key: string]: EmojiValue }
    aliases:    { [key: string]: string }
    sheet:      Sheet
}

export interface Category {
    id:     string
    emojis: string[]
}

export interface EmojiValue {
    id:         string
    name:       string
    keywords:   string[]
    skins:      Skin[]
    version:    number
    emoticons?: string[]
}

export interface Skin {
    unified: string
    native:  string
}

export interface Sheet {
    cols: number
    rows: number
}

export interface EmojiSlice {
    emojiData: Emoji | null
    fetchEmojiData: () => void
    getEmojiData: () => Emoji | null
}

export const createEmojiSlice: StateCreator<BoundStore, [], [], EmojiSlice> = (set, get) => ({
    emojiData: null,
    fetchEmojiData: async () => {
        const { token } = getCommunicationInfo()
        if (token.length < 3) return
        try {
            const emojiData = await apiGet<Emoji>('/assets/emoji-data.json')
            set({ emojiData })
        } catch (err) {
            console.log(err)
        }
    },
    getEmojiData: () => {
        if (get().emojiData === null) {
            get().fetchEmojiData()
        }
        return get().emojiData
    },
})
