import { TextChannel } from 'discord.js'

import { GameStatus } from '../constants/game'
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
  const winningPlayers = game.winningPlayers
  await asyncForEach(winningPlayers, async (player: Player) => {
    await channel.send(doEmbed(GameStatus.win, game, { player }))
  })
}
