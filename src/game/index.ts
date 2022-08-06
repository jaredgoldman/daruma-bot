import { TextChannel } from "discord.js";

export default async function startWaitingRoom(channel: TextChannel) {
  channel.send('game initiated')
}