"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Asset {
    constructor(assetId, assetName, assetUrl, unitName, localPath, alias) {
        this.assetId = assetId;
        this.assetName = assetName;
        this.assetUrl = assetUrl;
        this.unitName = unitName;
        this.localPath = localPath;
        this.alias = alias;
    }
}
exports.default = Asset;
