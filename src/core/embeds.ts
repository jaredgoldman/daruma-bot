// Discord
import {
  ColorResolvable,
  MessageOptions,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} from 'discord.js'
// Types/Constants
import { EmbedData } from '../types/game'
import { Embeds } from '../constants/embeds'
// Helpers
import { normalizeIpfsUrl } from '../utils/sharedUtils'
import Game from '../models/game'
import Player from '../models/player'

const defaultEmbedValues: EmbedData = {
  title: 'DarumaBot',
  description: 'placeholder',
  color: 'DarkAqua',
  footer: {
    text: 'placeholder',
    iconUrl: '#',
  },
}

export default function doEmbed(type: Embeds, game: Game): MessageOptions {
  let data: EmbedData = defaultEmbedValues
  let components: any = []

  const playerArr = game.getPlayerArray()
  const playerCount = game.getHasNpc() ? playerArr.length - 1 : playerArr.length

  switch (type) {
    case Embeds.waitingRoom:
      const playerWord = playerCount === 1 ? 'player' : 'players'
      const hasWord = playerCount === 1 ? 'has' : 'have'

      data = {
        title: 'Waiting Room',
        description: `${playerCount} ${playerWord} ${hasWord} joined the game.`,
        files: [],
        fields: playerArr
          .map((player) => {
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
            .setLabel('Choose your Daruma')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('start-game')
            .setLabel('Start game')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('withdraw-player')
            .setLabel('Withdraw Daruma')
            .setStyle(ButtonStyle.Danger)
        )
      )
      break
    case Embeds.activeGame:
      data = {
        title: 'Active Game',
        description: game.getBoard(),
      }
      break
    case Embeds.win:
      const winners = game.getWinningPlayerDiscordIds()
      data = {
        title: 'Game Over',
        description: `Win desciption placeholder`,
        fields: winners.map((winner: Player) => {
          return {
            name: winner.getUsername(),
            value: winner.asset.alias || winner.asset.name,
          }
        }),
      }
      break
    default: {
      data = defaultEmbedValues
    }
  }

  let { title, description, color, image, thumbNail, fields, footer, files } =
    data

  const embed = new EmbedBuilder()

  let thumbNailUrl

  if (thumbNail) {
    thumbNailUrl = normalizeIpfsUrl(thumbNail)
  }

  title && embed.setTitle(title)
  description && embed.setDescription(description)
  color && embed.setColor(color as ColorResolvable)
  image && embed.setImage(image)
  thumbNailUrl && embed.setThumbnail(thumbNailUrl)
  fields?.length && embed.addFields(fields)
  footer && embed.setFooter(footer)

  return {
    embeds: [embed],
    //@ts-ignore
    fetchReply: true,
    //@ts-ignore
    components,
    files: files?.length ? files : undefined,
  }
}
