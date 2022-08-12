"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAsset = void 0;
const database_service_1 = require("../database.service");
const addAsset = async (asset) => {
    const dbAsset = await database_service_1.collections.assets.findOne({ assetId: asset.assetId });
    if (dbAsset) {
        return;
    }
    else {
        return await database_service_1.collections.assets.insertOne(asset);
    }
};
exports.addAsset = addAsset;
