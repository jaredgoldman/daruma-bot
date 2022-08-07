"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.findUserByDiscordId = exports.findUserById = void 0;
const database_service_1 = require("../database.service");
const findUserById = async (_id) => {
    var _a;
    return await ((_a = database_service_1.collections.users) === null || _a === void 0 ? void 0 : _a.findOne({
        _id
    }));
};
exports.findUserById = findUserById;
const findUserByDiscordId = async (discordId) => {
    var _a;
    return await ((_a = database_service_1.collections.users) === null || _a === void 0 ? void 0 : _a.findOne({
        discordId
    }));
};
exports.findUserByDiscordId = findUserByDiscordId;
const updateUser = async (updateData, _id, discordId) => {
    if (!_id && !discordId) {
        throw new Error('you need to provide a discordId or userId to update a user');
    }
    const idObject = _id ? { _id } : { discordId };
    return await database_service_1.collections.users.findOneAndUpdate(idObject, { $set: Object.assign({}, updateData) });
};
exports.updateUser = updateUser;
