// Discord
import {
  ColorResolvable,
  MessagePayload,
  InteractionReplyOptions,
  MessageOptions,
  EmbedBuilder,
} from 'discord.js'
// Types/Constants
import { EmbedData } from './types/game'
import embeds from './constants/embeds'
// Game state
import { games } from '.'
// Helpers
import { normalizeIpfsUrl } from './utils/helpers'

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
  type: string,
  options?: any
):
  | string
  | MessagePayload
  | InteractionReplyOptions
  | EmbedBuilder
  | MessageOptions {
  let data: EmbedData = {}
  let components: any = []

  // Waiting Room

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
