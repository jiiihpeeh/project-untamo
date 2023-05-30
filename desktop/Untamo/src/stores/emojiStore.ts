import { create } from 'zustand'
//import json
import data from './emoji-data.json'

type UseEmoji = {
    getEmojiData: () => any
}

const useEmojiStore = create<UseEmoji>()(get => (
    {
        getEmojiData: () => {
            return data
        }
    }
))

export default useEmojiStore