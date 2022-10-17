import { TextChannel } from 'discord.js'
import Game from '../models/game'
import { asyncForEach } from '../utils/sharedUtils'
import doEmbed from '../core/embeds'
import { Embeds } from '../constants/embeds'
import Player from '../models/player'

export default async function win(game: Game, channel: TextChannel) {
  // handle win here
  const winningPlayers = game.getWinningPlayers()
  await asyncForEach(winningPlayers, async (player: Player) => {
    await channel.send(doEmbed(Embeds.win, game, { player }))
  })
}
