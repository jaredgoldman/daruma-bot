import { Interaction } from 'discord.js'
import User from '../models/user'

export const addRole = async (
  interaction: Interaction,
  roleId: string,
  user: User
): Promise<void> => {
  try {
    const role = interaction.guild?.roles.cache.find(
      (role) => role.id === roleId
    )
    const member = interaction.guild?.members.cache.find(
      (member) => member.id === user.discordId
    )
    role && (await member?.roles.add(role.id))
  } catch (error) {
    console.log('Error adding role', error)
  }
}

export const removeRole = async (
  interaction: Interaction,
  roleId: string,
  discordId: string
): Promise<void> => {
  const role = interaction.guild?.roles.cache.find((role) => role.id === roleId)
  const member = interaction.guild?.members.cache.find(
    (member) => member.id === discordId
  )
  role && (await member?.roles.remove(role.id))
}

export const confirmRole = async (
  roleId: string,
  interaction: Interaction,
  discordId: string
): Promise<boolean | undefined> => {
  const member = interaction.guild?.members.cache.find(
    (member) => member.id === discordId
  )
  return member?.roles.cache.has(roleId)
}
