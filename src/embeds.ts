// Discord
import {
  ColorResolvable,
  MessagePayload,
  InteractionReplyOptions,
  MessageOptions,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} from 'discord.js'
// Types/Constants
import { EmbedData } from './types/game'
import { Embeds } from './constants/embeds'
// Helpers
import { normalizeIpfsUrl } from './utils/helpers'
import Game from './models/game'

const defaultEmbedValues: EmbedData = {
  title: 'DarumaBot',
  description: 'placeholder',
  color: 'DarkAqua',
  footer: {
    text: 'placeholder',
    iconUrl: '#',
  },
  rawEmbed: false,
}

export default function doEmbed(
  type: Embeds,
  game: Game,
  options?: any
): MessageOptions {
  let data: EmbedData = {}
  let components: any = []

  const playerArr = Object.values(game.players)
  const playerCount = playerArr.length

  if (type === Embeds.waitingRoom) {
    const playerWord = playerCount === 1 ? 'player' : 'players'
    const hasWord = playerCount === 1 ? 'has' : 'have'

    data = {
      title: 'Waiting Room',
      description: `${playerCount} ${playerWord} ${hasWord} joined the game.`,
      files: [],
      fields: playerArr.map((player) => {
        return {
          name: player.username,
          value: player.asset.alias || player.asset.assetName,
        }
      }),
    }

    components.push(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('select-attacker')
          .setLabel('Choose your Daruma')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('begin-game')
          .setLabel('Start game')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('withdraw-player')
          .setLabel('Withdraw Daruma')
          .setStyle(ButtonStyle.Danger)
      )
    )
  }

  let {
    title,
    description,
    color,
    image,
    thumbNail,
    fields,
    footer,
    files,
    rawEmbed,
  } = {
    ...defaultEmbedValues,
    ...data,
  }

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

  if (rawEmbed) {
    return embed
  }

  return {
    embeds: [embed],
    fetchReply: true,
    //@ts-ignore
    components,
    files: files?.length ? files : undefined,
  }
}
