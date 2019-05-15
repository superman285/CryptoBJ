"use strict";

var DEFAULT_PAYOUT_MULTIPLY = 2;
var MULTIPLY_FOR_BLACKJACK = 2.5; // multiplier for blackjack (only counts when its a 2-card-21, not applied when user gets 21 from more than 2 cards)

var multiplierOnWin = exports.won = function(playerHasBlackjack) {
    if (playerHasBlackjack === true) {
        return MULTIPLY_FOR_BLACKJACK;
    }
    return DEFAULT_PAYOUT_MULTIPLY;
}

// extra stuff from engine-blackjack, in case you need it in future
var luckyLuckyMultiplier = exports.lucky = function (flatCards, suited, value) {
    var key = '' + flatCards + (suited ? 's' : '');
    if (key === '777s') {
        return 20;
    }
    if (key === '678s') {
        return 10;
    }
    if (key === '777') {
        return 5;
    }
    if (key === '678') {
        return 3;
    }
    if ((value.hi === 21 || value.lo === 21) && suited) {
        return 5;
    }
    if ((value.hi === 21 || value.lo === 21) && !suited) {
        return 3;
    }
    if (value.hi === 20 || value.lo === 20) {
        return 3;
    }
    if (value.hi === 19 || value.lo === 19) {
        return 2;
    }
    return 0;
};

module.exports = exports;