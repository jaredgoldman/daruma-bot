"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convergeTxnData = exports.updateTransactions = exports.searchForTransactions = exports.claimHoot = exports.findAsset = exports.isAssetCollectionAsset = exports.getAssetIdArrayFromTxnData = exports.determineOwnership = void 0;
const helpers_1 = require("./helpers");
const algosdk_1 = __importDefault(require("algosdk"));
const settings_1 = __importDefault(require("../settings"));
const fs_1 = __importDefault(require("fs"));
// import txnDataJson from '../txnData/txnData.json'
const __1 = require("..");
const algoNode = process.env.ALGO_NODE;
const pureStakeApi = process.env.PURESTAKE_API_TOKEN;
const algoIndexerNode = process.env.ALGO_INDEXER_NODE;
const optInAssetId = Number(process.env.OPT_IN_ASSET_ID);
const tokenMnemonic = process.env.TOKEN_MNEMONIC;
const token = {
    'X-API-Key': pureStakeApi,
};
const server = algoNode;
const indexerServer = algoIndexerNode;
const port = '';
const algodClient = new algosdk_1.default.Algodv2(token, server, port);
const algoIndexer = new algosdk_1.default.Indexer(token, indexerServer, port);
const defaultAssetData = {
    wins: 0,
    losses: 0,
    kos: 0,
    assetId: null,
    unitName: '',
    alias: '',
};
const determineOwnership = async function (address, channelId) {
    try {
        // First update transactions
        const txnData = await (0, exports.convergeTxnData)(__1.creatorAddressArr, true);
        fs_1.default.writeFileSync('dist/txnData/txnData.json', JSON.stringify(txnData));
        let { assets } = await algoIndexer
            .lookupAccountAssets(address)
            .limit(10000)
            .do();
        const { maxAssets } = settings_1.default[channelId];
        let walletOwned = false;
        // const assetIdsOwned: number[] = []
        const nftsOwned = [];
        // Create array of unique assetIds
        const uniqueAssets = [];
        assets.forEach((asset) => {
            // Check if opt-in asset
            if (asset['asset-id'] === Number(optInAssetId)) {
                walletOwned = true;
            }
            // ensure no duplicate assets
            const result = uniqueAssets.findIndex((item) => asset['asset-id'] === item['asset-id']);
            if (result <= -1 && asset.amount > 0) {
                uniqueAssets.push(asset);
            }
        });
        const data = getTxnData();
        const assetIdArr = (0, exports.getAssetIdArrayFromTxnData)(data);
        // Determine which assets are part of bot collection
        const assetIdsOwned = uniqueAssets.filter((asset) => {
            const assetId = asset['asset-id'];
            if (assetIdsOwned.length < maxAssets &&
                (0, exports.isAssetCollectionAsset)(assetId, assetIdArr)) {
                return true;
            }
        });
        // fetch data for each asset but not too quickly
        await (0, helpers_1.asyncForEach)(assetIdsOwned, async (assetId) => {
            const assetData = await (0, exports.findAsset)(assetId);
            if (assetData) {
                const { name: assetName, url } = assetData.params;
                nftsOwned.push(Object.assign(Object.assign({}, defaultAssetData), { url, assetId, assetName }));
            }
            await (0, helpers_1.wait)(250);
        });
        return {
            walletOwned,
            nftsOwned,
        };
    }
    catch (error) {
        console.log(error);
        return {
            walletOwned: false,
            nftsOwned: [],
        };
    }
};
exports.determineOwnership = determineOwnership;
// get array of unique assetIds from txnData
const getAssetIdArrayFromTxnData = (txnData) => {
    const assetIdArr = [];
    txnData.transactions.forEach((txn) => {
        const assetId = txn['asset-config-transaction']['asset-id'];
        const createdAssetId = txn['created-asset-index'];
        if (assetId) {
            const result = assetIdArr.findIndex((item) => item === assetId);
            result <= -1 && assetIdArr.push(assetId);
        }
        if (createdAssetId) {
            const result2 = assetIdArr.findIndex((item) => item === createdAssetId);
            result2 <= -1 && assetIdArr.push(createdAssetId);
        }
    });
    return assetIdArr;
};
exports.getAssetIdArrayFromTxnData = getAssetIdArrayFromTxnData;
const isAssetCollectionAsset = (assetId, assetIdArr) => assetIdArr.includes(assetId);
exports.isAssetCollectionAsset = isAssetCollectionAsset;
const findAsset = async (assetId) => {
    try {
        const assetData = await algoIndexer.searchForAssets().index(assetId).do();
        if (assetData === null || assetData === void 0 ? void 0 : assetData.assets)
            return assetData.assets[0];
    }
    catch (error) {
        console.log(error);
    }
};
exports.findAsset = findAsset;
const claimHoot = async (amount, receiverAddress) => {
    try {
        const params = await algodClient.getTransactionParams().do();
        const { sk, addr: senderAddress } = algosdk_1.default.mnemonicToSecretKey(tokenMnemonic);
        const revocationTarget = undefined;
        const closeRemainderTo = undefined;
        const note = undefined;
        const assetId = optInAssetId;
        let xtxn = algosdk_1.default.makeAssetTransferTxnWithSuggestedParams(senderAddress, receiverAddress, closeRemainderTo, revocationTarget, amount, note, assetId, params);
        const rawSignedTxn = xtxn.signTxn(sk);
        let xtx = await algodClient.sendRawTransaction(rawSignedTxn).do();
        await algosdk_1.default.waitForConfirmation(algodClient, xtx.txId, 4);
    }
    catch (error) {
        console.log(error);
    }
};
exports.claimHoot = claimHoot;
// Finds all transactions from address
const searchForTransactions = async (address) => {
    const type = 'acfg';
    const txns = (await algoIndexer
        .searchForTransactions()
        .address(address)
        .txType(type)
        .do());
    return txns;
};
exports.searchForTransactions = searchForTransactions;
const updateTransactions = async (accountAddress, currentRound) => {
    const type = 'acfg';
    return (await algoIndexer
        .searchForTransactions()
        .address(accountAddress)
        .txType(type)
        .minRound(currentRound)
        .do());
};
exports.updateTransactions = updateTransactions;
// Fetches all data and reduces it to one object
const convergeTxnData = async (creatorAddresses, update) => {
    const updateCalls = [];
    const txnData = getTxnData();
    creatorAddresses.forEach((address) => {
        if (update) {
            const currentRound = txnData['current-round'];
            updateCalls.push((0, exports.updateTransactions)(address, currentRound));
        }
        else {
            updateCalls.push((0, exports.searchForTransactions)(address));
        }
    });
    const txnDataArr = await Promise.all(updateCalls);
    const reduceArr = [...txnDataArr];
    if (update) {
        const currentTxnData = getTxnData();
        reduceArr.push(currentTxnData);
    }
    return reduceTxnData(reduceArr);
};
exports.convergeTxnData = convergeTxnData;
const reduceTxnData = (txnDataArray) => {
    const reducedData = txnDataArray.reduce((prevTxnData, txnData) => {
        return {
            ['current-round']: prevTxnData['current-round'] < txnData['current-round']
                ? prevTxnData['current-round']
                : txnData['current-round'],
            ['next-token']: prevTxnData['next-token'],
            transactions: [...prevTxnData.transactions, ...txnData.transactions],
        };
    });
    // console.log(util.inspect(reducedData, { depth: 1 }))
    return reducedData;
};
const getTxnData = () => {
    try {
        return JSON.parse(fs_1.default.readFileSync('dist/txnData/txnData.json', 'utf-8'));
    }
    catch (e) {
        ///
    }
};
