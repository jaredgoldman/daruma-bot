// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction } from 'discord.js'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test-command')
    .setDescription('test command'),
  async execute(interaction: Interaction) {},
}
