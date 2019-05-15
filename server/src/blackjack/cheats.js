const {serializeCards} = require('./engine/deck');

/*
 ♥
 ♦
 ♣
 ♠
 */

// make sure that cards have only 1 space between each other
module.exports = {
    player_21: serializeCards('♠8 ♠1 ♥5 ♣7 ♦2 ♦5 ♦3 ♥4'),
    player_blackjack: serializeCards('♠10 ♠1 ♥7 ♣6 ♦2 ♦5 ♦3 ♥4'),
    dealer_blackjack: serializeCards('♥5 ♣7 ♠10 ♠1 ♦1 ♦5 ♦3'),
    dealer_blackjack_2: serializeCards('♥4 ♣3 ♠1 ♠10 ♦1 ♦5 ♦3'),
    split: serializeCards('♠10 ♦J ♥5 ♣6 ♠7 ♦2 ♦1 ♦5 ♦3 ♦6 ♥6'),
    dealer_win: serializeCards('♠10 ♦J ♥5 ♣6 ♠10 ♦10 ♦10 ♦10 ♦4 ♦7'),
    double_ace: serializeCards('♥1 ♦1 ♠10 ♦10 ♥10 ♣10 ♦4 ♦7 ♥5 ♣7'),
}