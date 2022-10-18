import { Client, GuildEmoji } from 'discord.js'

const emojiConfig = {
  '3png': 'SpinCritical_PNG',
  '2png': 'SpinHeadButt_PNG',
  '1png': 'SpinHeadRam_PNG',
  ph: 'PH',
  '1gif': '1_',
  '2gif': '2_',
  '3gif': '3_',
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
