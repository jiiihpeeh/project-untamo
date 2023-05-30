import { create } from 'zustand'
import axios from 'axios'
import { createJSONStorage, persist } from 'zustand/middleware'
import { getCommunicationInfo } from '../stores'

type UseEmoji = {
    emojiData: string|null,
    fetchEmojiData: () => void
    getEmojiData: () => string | null
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
                    let emojiData = res.data as string
                    set({ emojiData: emojiData })
                } catch (err) {
                }
            },
            getEmojiData:  () => {
                if (get().emojiData === null) {
                    get().fetchEmojiData()
                }
                return get().emojiData
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