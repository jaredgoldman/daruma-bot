import { ObjectId } from 'mongodb'
import Asset from '../models/asset'
import Player from '../models/player'

const _id = '62ef1c8a025749c105593cbf' as unknown as ObjectId

const asset = new Asset(
  718129390,
  'AlgoDaruma #0051',
  'ipfs://bafybeihkimkkmq4vm3r3fzepp3ibcdoimdeet3t3can7rxo7d4h5evm5rm#i',
  'DRMA51'
)

const players = {
  '717166398320672867': new Player(
    'test-user-1',
    '717166398320672867',
    'RIY4VDR6L2NTSLIBRDATJ5WSGLJTO4QH775FPDPTNC4XRFNPRIE2K7UPQ4',
    asset,
    _id,
    [],
    0
  ),
  '977691495245164585': new Player(
    'test-user-2',
    '977691495245164585',
    'RIY4VDR6L2NTSLIBRDATJ5WSGLJTO4QH775FPDPTNC4XRFNPRIE2K7UPQ4',
    asset,
    _id,
    [],
    0
  ),
} as { [key: string]: Player }

const settings = {
  maxAssets: 20,
  minCapacity: 2,
  maxCapacity: 2,
  npcHp: 100,
  imageDir: 'dist/nftAssets',
  playerHp: 100,
  rollInterval: 1000 * 2,
}

export { players, settings }
