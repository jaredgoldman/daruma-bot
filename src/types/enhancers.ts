export type EnhancerSettings = {
  [key in EnhancerType]: EnhancerSetting
}

export type UserEnhancers = {
  [key in EnhancerType | any]: UserEnhancer
}

export interface EnhancerSetting {
  type: EnhancerType
  karmaRequired: number
}

export interface UserEnhancer {
  type: EnhancerType
  owned: boolean
}

export enum EnhancerType {
  ARMS = 'ARMS',
  LEGS = 'LEGS',
  MEDITATION = 'MEDITATION',
  NIRVANA = 'NIRVANA',
}
