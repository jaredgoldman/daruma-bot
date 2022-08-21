"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollDice = void 0;
const diceValues = {
    1: 1,
    2: 1,
    3: 2,
    4: 2,
    5: 3,
    6: 3,
};
const rollDice = () => {
    const ref = Math.floor(Math.random() * 6) + 1;
    return {
        number: diceValues[ref],
        diceValue: ref,
    };
};
exports.rollDice = rollDice;