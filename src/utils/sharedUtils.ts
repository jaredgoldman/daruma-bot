import { env } from './environment'

export const asyncForEach = async (
  array: Array<any>,
  // eslint-disable-next-line @typescript-eslint/ban-types
  callback: Function
): Promise<void> => {
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

const isIpfs = (url: string): boolean => url?.slice(0, 4) === 'ipfs'

export const normalizeIpfsUrl = (url: string): string => {
  if (isIpfs(url)) {
    const ipfsHash = url.slice(7)
    return `${env.IPFS_GATEWAY}${ipfsHash}`
  } else {
    return url
  }
}
