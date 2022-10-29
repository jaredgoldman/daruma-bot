// Discord
import {
  ActionRowBuilder,
  BaseMessageOptions,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js'

// Schemas
// Helpers
import Game from '../models/game'
import Player from '../models/player'
import { CooldownContent, EmbedType } from '../types/embeds'
import { env } from '../utils/environment'
import { normalizeIpfsUrl } from '../utils/sharedUtils'

/**
 * Abstraction for building embeds
 * @param type {GameStatus}
 * @param game {Game}
 * @param options {any}
 * @returns
 */
export default function doEmbed<T>(
  type: EmbedType,
  game: Game,
  data?: T
): BaseMessageOptions {
  const embed = new EmbedBuilder()
    .setTitle(`${env.ALGO_UNIT_NAME} Bot`)
    .setColor('DarkAqua')

  const components: any = []
  const playerArr = game.playerArray
  const playerCount = game.hasNpc ? playerArr.length - 1 : playerArr.length
  const playerWord = playerCount === 1 ? 'player' : 'players'
  const hasWord = playerCount === 1 ? 'has' : 'have'

  //const playerCount = playerArr.length
  switch (type) {
    case EmbedType.waitingRoom: {
      embed
        .setTitle(`${game.type.toString()} - Waiting Room`)
        .setDescription(
          `${playerCount} ${playerWord} ${hasWord} joined the game.`
        )
        .setFields(playerArrFields(playerArr))

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
    case EmbedType.activeGame: {
      const playerMessage = game.playerArray
        .map((player: Player, index: number) => {
          return player.isNpc
            ? `${index + 1} - **${player.asset.name}**`
            : `${index + 1} - <@${player.discordId}>`
        })
        .join('\n')
      embed
        .setTitle('Enjoy the battle!')
        .setDescription(`${game.type}`)
        .setFields(playerArrFields(playerArr))
        .setImage(env.IMAGE_CDN + game.type + '.gif')
        .addFields([{ name: `Players`, value: playerMessage }])
      break
    }
    case EmbedType.win: {
      const player = data as Player
      embed
        .setTitle('Game Over')
        .setDescription(`${player.username} WON the game!`)
        .setImage(normalizeIpfsUrl(player.asset.url))

      break
    }
    case EmbedType.cooldown: {
      const cooldownContent = data as CooldownContent
      const fields = cooldownContent.map(content => {
        return {
          name: content.name,
          value: content.timeString,
        }
      })
      embed
        .setTitle('Cooldowns')
        .setDescription('Cooldowns description')
        .setFields(fields)
    }
  }

  return {
    embeds: [embed],
    components,
  }
}

const playerArrFields = (
  playerArr: Player[]
): {
  name: string
  value: string
}[] => {
  return playerArr
    .map(player => {
      if (player.isNpc) return
      return {
        name: player.username,
        value: player.asset.alias || player.asset.name,
      }
    })
    .filter(Boolean) as { name: string; value: string }[]
}
