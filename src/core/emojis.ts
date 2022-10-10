import { Client, GuildEmoji } from 'discord.js'

const emojiConfig = {
  3: 'SpinCritical_PNG',
  2: 'SpinHeadButt_PNG',
  1: 'SpinHeadRam_PNG',
  ph: 'PH',
}

const gatherEmojis = (client: Client): Emojis => {
  const emojis: Emojis = {}

  Object.entries(emojiConfig).forEach(([key, value]) => {
    try {
      const emoji = client.emojis.cache.find(
        (emoji) => emoji.name === value
      ) as GuildEmoji
      emojis[key] = emoji.toString()
    } catch (error) {
      console.log(`****** emoji ${value} is unsupported ******`, error)
    }
  })

  return emojis
}

interface Emojis {
  [key: number | string]: string
}

export default gatherEmojis
