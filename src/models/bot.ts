import AsyncExitHook from 'async-exit-hook'
import {
  AutocompleteInteraction,
  ButtonInteraction,
  Client,
  Collection,
  CommandInteraction,
  Events,
  Interaction,
  SelectMenuInteraction,
  TextChannel,
} from 'discord.js'
import fs from 'node:fs'

import gatherEmojis from '../core/emojis'
import { connectToDatabase } from '../database/database.service'
import { getSettings } from '../database/operations/game'
import { connectToRedis } from '../database/redis.service'
import startWaitingRoom from '../game'
import { ChannelSettings } from '../types/game'
import { initLog, Logger } from '../utils/logger'
import * as Logs from '../utils/logs.json'
import { asyncForEach } from '../utils/sharedUtils'
import Game from './game'

export let games: { [key: string]: Game } = {}
export let emojis: { [key: number | string]: string } = {}

export class Bot {
  private ready = false

  constructor(private token: string, private client: Client) {}

  public async start(): Promise<void> {
    this.registerListeners()
    await this.login(this.token)
  }

  private registerListeners(): void {
    this.client.on(Events.ClientReady, () => this.onReady())
    this.client.on(Events.InteractionCreate, (intr: Interaction) =>
      this.onInteraction(intr)
    )
    this.client.on(Events.Debug, info => {
      Logger.debug(info)
    })
    this.client.on(Events.Warn, warn => {
      Logger.warn(warn)
    })
    this.client.on(Events.Error, error => {
      Logger.error('TRACE', error)
    })
  }

  private async login(token: string): Promise<void> {
    try {
      await this.client.login(token)
    } catch (error) {
      Logger.error(Logs.error.clientLogin, error)
      return
    }
  }

  private async onReady(): Promise<void> {
    let userTag = this.client.user?.tag as string
    Logger.info(Logs.info.clientLogin.replaceAll('{USER_TAG}', userTag))

    this.ready = true
    Logger.info(Logs.info.clientReady)
    Logger.info(await initLog(this.client))
    // Connect to db instance
    await connectToDatabase()
    await connectToRedis()
    // Grab emojis from cache
    emojis = gatherEmojis(this.client)
    // Register discord commands
    this.setupCommands()
    // Start game for each channel
    this.startGame()
    AsyncExitHook((done: () => any) => {
      Logger.info(`[exit-hook] Logged out of <${this.client.user?.tag}>`)
      this.client.destroy()
      return done()
    })
  }

  private async onInteraction(intr: Interaction): Promise<void> {
    let command

    if (!this.ready) {
      return
    }

    if (
      intr instanceof CommandInteraction ||
      intr instanceof AutocompleteInteraction
    ) {
      try {
        command = this.client.commands.get(intr.commandName)
      } catch (error) {
        Logger.error(Logs.error.command, error)
      }
    } else if (
      intr instanceof SelectMenuInteraction ||
      intr instanceof ButtonInteraction
    ) {
      try {
        command = this.client.commands.get(intr.customId)
      } catch (error) {
        Logger.error(Logs.error.button, error)
      }
    }
    try {
      if (!command) return
      await command.execute(intr)
    } catch (error) {
      Logger.error(Logs.error.unspecified, error)
    }
  }
  private startGame = async (): Promise<void> => {
    try {
      // start game for each channel
      await asyncForEach(
        await getSettings(),
        async (settings: ChannelSettings) => {
          const channel = this.client.channels.cache.get(
            settings.channelId
          ) as TextChannel
          const newGame = new Game(settings)
          games[settings.channelId] = newGame
          startWaitingRoom(channel)
        }
      )
    } catch (error) {
      Logger.error('****** ERROR STARTING GAMES ******', error)
    }
  }

  private setupCommands = (): void => {
    try {
      this.client.commands = new Collection()
      const commandFiles = fs.readdirSync('./src/commands')
      for (const file of commandFiles) {
        const name = file.endsWith('.ts')
          ? file.replace('.ts', '')
          : file.replace('.js', '')
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const command = require(`../commands/${name}`)
        this.client.commands.set(command.data.name, command)
      }
    } catch (error) {
      Logger.error('****** ERROR SETTING UP COMMANDS ******', error)
    }
  }
}
