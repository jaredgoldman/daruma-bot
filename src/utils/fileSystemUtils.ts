import fs from 'fs'
import path from 'path'
import axios from 'axios'
import Game from '../models/game'
import Asset from '../models/asset'
import { normalizeIpfsUrl } from './sharedUtils'

export const downloadAssetImage = async (
  asset: Asset,
  username: string,
  directory: string
): Promise<string | void> => {
  try {
    const url = asset.url
    if (url) {
      const normalizedUrl = normalizeIpfsUrl(url) as string
      const path = `${directory}${username
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
        .trim()}.jpg`
      const writer = fs.createWriteStream(path)
      const res = await axios.get(normalizedUrl, {
        responseType: 'stream',
      })
      res.data.pipe(writer)

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          return resolve(path)
        })
        writer.on('error', (err) => console.log(err))
      })
    }
  } catch (error) {
    console.log('ERROR:', error)
  }
}

export const emptyDir = (dirPath: string): void => {
  try {
    const dirContents = fs.readdirSync(dirPath)
    dirContents.forEach((filePath) => {
      const fullPath = path.join(dirPath, filePath)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) {
        if (fs.readdirSync(fullPath).length) emptyDir(fullPath)
        fs.rmdirSync(fullPath)
      } else fs.unlinkSync(fullPath)
    })
  } catch (error) {
    console.log('Error deleting contents of image directory', error)
  }
}
