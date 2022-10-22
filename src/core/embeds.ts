// Discord
import {
  ActionRowBuilder,
  AttachmentBuilder,
  BaseMessageOptions,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js'

// Schemas
import { Embeds } from '../constants/embeds'
// Helpers
import Game from '../models/game'
import Player from '../models/player'
import { EmbedData } from '../types/game'
import { env } from '../utils/environment'
import { normalizeIpfsUrl } from '../utils/sharedUtils'

const defaultEmbedValues: EmbedData = {
  title: `${env.ALGO_UNIT_NAME} Bot`,
  description: 'placeholder',
  color: 'DarkAqua',
  footer: {
    text: 'placeholder',
    iconUrl: '#',
  },
}

type EmbedOptions = {
  player?: Player
}

/**
 * Abstraction for building embeds
 * @param type {Embeds}
 * @param game {Game}
 * @param options {any}
 * @returns
 */
export default function doEmbed(
  type: Embeds,
  game: Game,
  options?: EmbedOptions
): BaseMessageOptions {
  let data: EmbedData = defaultEmbedValues
  const components: any = []

  const playerArr = game.getPlayerArray()
  const playerCount = game.getHasNpc() ? playerArr.length - 1 : playerArr.length

  switch (type) {
    case Embeds.waitingRoom: {
      const playerWord = playerCount === 1 ? 'player' : 'players'
      const hasWord = playerCount === 1 ? 'has' : 'have'

      data = {
        title: 'Waiting Room',
        description: `${playerCount} ${playerWord} ${hasWord} joined the game.`,
        files: [],
        fields: playerArr
          .map(player => {
            if (player.getIsNpc()) return
            return {
              name: player.getUsername(),
              value: player.asset.alias || player.asset.name,
            }
          })
          .filter(Boolean) as { name: string; value: string }[],
      }

      components.push(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('select-player')
            .setLabel(`Choose your ${env.ALGO_UNIT_NAME}`)
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('start-game')
            .setLabel('Start game')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('withdraw-player')
            .setLabel(`Withdraw ${env.ALGO_UNIT_NAME}`)
            .setStyle(ButtonStyle.Danger)
        )
      )
      break
    }
    case Embeds.activeGame: {
      data = {
        title: 'Active Game',
        description: game.getBoard(),
        fields: playerArr
          .map(player => {
            if (player.getIsNpc()) return
            return {
              name: player.getUsername(),
              value: player.asset.alias || player.asset.name,
            }
          })
          .filter(Boolean) as { name: string; value: string }[],
      }
      break
    }
    case Embeds.win: {
      const player = options?.player as Player
      const isNpc = player.getIsNpc()
      data = {
        title: 'Game Over',
        description: `${player.getUsername()} won the game!`,
      }
      if (isNpc) data.files = [new AttachmentBuilder('src/assets/NPC_Win.gif')]
      else data.image = normalizeIpfsUrl(player.asset.url)
      break
    }
    default: {
      data = defaultEmbedValues
    }
  }

  const { title, description, color, image, thumbNail, fields, footer, files } =
    data

  const embed = new EmbedBuilder()

  let thumbNailUrl

  if (thumbNail) {
    thumbNailUrl = normalizeIpfsUrl(thumbNail)
  }

  title && embed.setTitle(title)
  description && embed.setDescription(description)
  color && embed.setColor(color)
  image && embed.setImage(image)
  thumbNailUrl && embed.setThumbnail(thumbNailUrl)
  fields?.length && embed.addFields(fields)
  footer && embed.setFooter(footer)

  return {
    embeds: [embed],
    components,
    files: files?.length ? files : undefined,
  }
}
