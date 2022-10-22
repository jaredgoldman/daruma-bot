import { TextChannel } from 'discord.js'

import { Embeds } from '../constants/embeds'
import doEmbed from '../core/embeds'
import Game from '../models/game'
import Player from '../models/player'
import { asyncForEach } from '../utils/sharedUtils'

/**
 * Send a winning embed for each winning player
 * @param game {Game}
 * @param channel {TextChannel}
 */
export default async function win(
  game: Game,
  channel: TextChannel
): Promise<void> {
  const winningPlayers = game.getWinningPlayers()
  await asyncForEach(winningPlayers, async (player: Player) => {
    await channel.send(doEmbed(Embeds.win, game, { player }))
  })
}
