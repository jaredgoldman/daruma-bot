// Discord
import { Client, GuildEmoji } from 'discord.js'

import { Logger } from '../utils/logger'

const emojiConfig = {
  '3png': 'Ct',
  '2png': 'HB',
  '1png': 'Rm',
  ph: 'PH',
  '1gif': '1_',
  '2gif': '2_',
  '3gif': '3_',
}

/**
 * Grabs all necessary emojis from discord cache and makes available for easy use throughout game
 * @param client
 * @returns
 */
const gatherEmojis = (client: Client): Emojis => {
  const emojis: Emojis = {}

  Object.entries(emojiConfig).forEach(([key, value]) => {
    try {
      const emoji = client.emojis.cache.find(
        emoji => emoji.name === value
      ) as GuildEmoji
      emojis[key] = emoji.toString()
    } catch (error) {
      Logger.error(`****** emoji ${value} is unsupported ******`, error)
    }
  })

  return emojis
}

interface Emojis {
  [key: number | string]: string
}

export default gatherEmojis
