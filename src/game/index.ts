import { TextChannel, MessageOptions } from 'discord.js'
import settings from '../settings'
import { resetGame } from '../utils/helpers'
import doEmbed from '../embeds'
import { Embeds } from '../constants/embeds'
import { games } from '..'
import { wait } from '../utils/shared'
import runGame from './runGame'

export default async function startWaitingRoom(channel: TextChannel) {
  const { maxCapacity } = settings[channel.id]
  const game = games[channel.id]

  resetGame(false, channel.id)

  game.megatron = await channel.send(
    doEmbed(Embeds.waitingRoom, game) as MessageOptions
  )

  game.waitingRoom = true
  let playerCount = 0
  const getPlayerCount = () => Object.values(game.players).length

  while (playerCount < maxCapacity && game.waitingRoom) {
    if (game.update) {
      await game.megatron.edit(doEmbed(Embeds.waitingRoom, game))
      playerCount = getPlayerCount()
    }
    await wait(1000)
  }

  if (game.waitingRoom) game.waitingRoom = false

  await wait(2000)

  game.active = true

  runGame(game, false)
}
