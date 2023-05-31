import { create } from 'zustand'
//import json
import data from './emoji-data.json'


export interface Emoji {
    categories: Category[];
    emojis:     { [key: string]: EmojiValue };
    aliases:    { [key: string]: string };
    sheet:      Sheet;
}

export interface Category {
    id:     string;
    emojis: string[];
}

export interface EmojiValue {
    id:         string;
    name:       string;
    keywords:   string[];
    skins:      Skin[];
    version:    number;
    emoticons?: string[];
}

export interface Skin {
    unified: string;
    native:  string;
}

export interface Sheet {
    cols: number;
    rows: number;
}


type UseEmoji = {
    getEmojiData: () => Emoji
}

const useEmojiStore = create<UseEmoji>()(get => (
    {
        getEmojiData: () => {
            return data as Emoji
        }
    }
))

export default useEmojiStore