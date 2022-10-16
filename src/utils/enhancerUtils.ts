import User from '../models/user'
import {
  EnhancerSetting,
  EnhancerSettings,
  UserEnhancers,
} from '../types/enhancers'

export const checkForEnhancers = (
  enhancerSettings: EnhancerSettings,
  user: User
): UserEnhancers => {
  const userEnhancers: UserEnhancers = {}
  // grab users karma
  const { karma } = user
  // for each enhacer setting, see if the user has enough karma to unlock it
  Object.values(enhancerSettings).forEach((enhancer: EnhancerSetting) => {
    const { type, karmaRequired } = enhancer
    const owned = karma >= karmaRequired
    userEnhancers[type] = {
      type,
      owned,
    }
  })
  return userEnhancers
}
