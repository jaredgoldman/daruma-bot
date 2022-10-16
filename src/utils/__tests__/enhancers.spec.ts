import User from '../../models/user'
import {
  EnhancerType,
  EnhancerSetting,
  UserEnhancer,
  EnhancerSettings,
} from '../../types/enhancers'

const enhancerSettings: EnhancerSettings = {
  [EnhancerType.ARMS]: {
    type: EnhancerType.ARMS,
    karmaRequired: 100,
  },
  [EnhancerType.LEGS]: {
    type: EnhancerType.LEGS,
    karmaRequired: 100,
  },
  [EnhancerType.MEDITATION]: {
    type: EnhancerType.MEDITATION,
    karmaRequired: 100,
  },
  [EnhancerType.NIRVANA]: {
    type: EnhancerType.NIRVANA,
    karmaRequired: 100,
  },
}

const user = new User('test', 'test', 'test', {})
user.karma = 100

describe('enhancers test suite', () => {
  it('should return an object with the correct boolean values', () => {})
})
