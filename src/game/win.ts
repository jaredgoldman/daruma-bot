import { TextChannel } from 'discord.js'

import { Embeds } from '../constants/embeds'
import doEmbed from '../core/embeds'
import Game from '../models/game'
import Player from '../models/player'
import { asyncForEach } from '../utils/sharedUtils'

export default async function win(
  game: Game,
  channel: TextChannel
): Promise<void> {
  // handle win here
  const winningPlayers = game.getWinningPlayers()
  await asyncForEach(winningPlayers, async (player: Player) => {
    await channel.send(doEmbed(Embeds.win, game, { player }))
  })
}
