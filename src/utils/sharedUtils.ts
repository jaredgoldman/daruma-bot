import { EnvVariables } from '../types/shared'
const ipfsGateway = process.env.IPFS_GATEWAY || 'https://ipfs.filebase.io/ipfs/'

export const asyncForEach = async (array: Array<any>, callback: Function): Promise<void> => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

export const wait = async (duration: number): Promise<void> => {
  await new Promise(res => {
    setTimeout(res, duration)
  })
}

export const getNumberSuffix = (num: number): string => {
  if (num === 1) return '1st'
  if (num === 2) return '2nd'
  if (num === 3) return '3rd'
  else return `${num}th`
}

export const randomNumber = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min) + min)

export const randomSort = (arr: any[]): any[] => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i)
    const k = arr[i]
    arr[i] = arr[j]
    arr[j] = k
  }
  return arr
}

export const isIpfs = (url: string): boolean => url?.slice(0, 4) === 'ipfs'

export const normalizeIpfsUrl = (url: string): string => {
  if (isIpfs(url)) {
    const ifpsHash = url.slice(7)
    return `${ipfsGateway}${ifpsHash}`
  } else {
    return url
  }
}

export const checkEnv = (): void => {
  const envKeys = Object.values(EnvVariables).filter(
    value => typeof value === 'string'
  ) as (keyof typeof EnvVariables)[]

  for (const envKey of envKeys) {
    if (process.env[envKey] === undefined) {
      throw new Error(`Env variable "${envKey}" not set`)
    }
  }
}
