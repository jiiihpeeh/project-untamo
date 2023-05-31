import { create } from 'zustand'
import axios from 'axios'
import { createJSONStorage, persist } from 'zustand/middleware'
import { getCommunicationInfo } from '../stores'


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
    emojiData: Emoji|null,
    fetchEmojiData: () => void
    getEmojiData: () => Emoji|null
}

const useEmojiStore = create<UseEmoji>()(
    persist(
      (set,get) => (
          {
            emojiData: null,
            fetchEmojiData: async () => {
                const { server, token } = getCommunicationInfo()
                if (token.length < 3) {
                    return
                }
                try {
                    let res = await axios.get(`${server}/assets/emoji-data.json`,
                        {
                            headers: {
                                token: token
                            }
                        }
                    )
                    let emojiData = JSON.parse(res.data) as Emoji
                    set({ emojiData: emojiData })
                } catch (err) {
                }
            },
            getEmojiData:  () => {
                if (get().emojiData === null) {
                    get().fetchEmojiData()
                }
                let data = get().emojiData
                if(data === null){
                    return null
                }
                return data
            }
        }
      ),
      {
          name: 'emojiData', 
          storage: createJSONStorage(() => localStorage), 
          partialize: (state) => (
              { 
                emojiData: state.emojiData,
              }
          ),
      }
    )
)

export default useEmojiStore