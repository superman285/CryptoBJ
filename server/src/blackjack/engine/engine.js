"use strict";

exports.getPrizes = exports.getPrize = exports.isActionAllowed = exports.getSideBetsInfo = exports.isPerfectPairs = exports.getLuckyLuckyMultiplier = exports.isLuckyLucky = exports.getHandInfoAfterInsurance = exports.getHandInfoAfterSurrender = exports.getHandInfoAfterStand = exports.getHandInfoAfterDouble = exports.getHandInfoAfterHit = exports.getHandInfoAfterSplit = exports.getHandInfoAfterDeal = exports.getHandInfo = exports.countCards = exports.isSuited = exports.isSoftHand = exports.isBlackjack = exports.checkForBusted = exports.getHigherValidValue = exports.calculate = exports.isNullOrUndef = exports.isUndefined = exports.isNull = undefined;

var payout = require('./payout');
var TYPES = require('./constants');
const {isNull, isUndefined, isNullOrUndef} = require('./helpers');

var calculate = exports.calculate = function calculate(array) {
    if (array.length === 1) {
        if (isNullOrUndef(array[0])) {
            return null;
        }
        var _value = array[0].value;
        return {
            hi: _value === 1 ? 11 : _value,
            lo: _value === 1 ? 1 : _value
        };
    }
    var aces = [];
    var value = array.reduce(function (memo, x) {
        if (x.value === 1) {
            aces.push(1);
            return memo;
        }
        memo += x.value;
        return memo;
    }, 0);
    return aces.reduce(function (memo) {
        if (memo.hi + 11 <= 21) {
            memo.hi += 11;
            memo.lo += 1;
        } else {
            memo.hi += 1;
            memo.lo += 1;
        }
        if (memo.hi > 21 && memo.lo <= 21) {
            memo.hi = memo.lo;
        }
        return memo;
    }, {
        hi: value,
        lo: value
    });
};

var getHigherValidValue = exports.getHigherValidValue = function getHigherValidValue(handValue) {
    return handValue.hi <= 21 ? handValue.hi : handValue.lo;
};

var checkForBusted = exports.checkForBusted = function checkForBusted(handValue) {
    return handValue.hi > 21 && handValue.lo === handValue.hi;
};

var isBlackjack = exports.isBlackjack = function isBlackjack(array) {
    return array.length === 2 && calculate(array).hi === 21;
};

var handHasCardWithValue = exports.handHasCardWithValue = function(value, array){
    return array.some(function(x){
       return x.value === value;
    });
}

var firstCardOnDeck = exports.firstCardOnDeck = function(value, array){
    console.log('firstCardOnDeck', value, array[0].value);
    return array[0].value === value;
}

var isSoftHand = exports.isSoftHand = function isSoftHand(array) {
    return array.some(function (x) {
            return x.value === 1;
        }) && array.reduce(function (memo, x) {
            memo += x.value === 1 && memo < 11 ? 11 : x.value;
            return memo;
        }, 0) === 17;
};

var isSuited = exports.isSuited = function isSuited() {
    var array = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    if (array.length === 0) {
        return false;
    }
    var suite = array[0].suite;
    return array.every(function (x) {
        return x.suite === suite;
    });
};

var countCards = exports.countCards = function countCards(array) {
    var systems = {
        'Hi-Lo': [-1, 1, 1, 1, 1, 1, 0, 0, 0, -1, -1, -1, -1]
    };
    return array.reduce(function (memo, x) {
        memo += systems['Hi-Lo'][x.value - 1];
        return memo;
    }, 0);
};

var getHandInfo = exports.getHandInfo = function getHandInfo(playerCards, dealerCards) {
    var hasSplit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var handValue = calculate(playerCards);
    if (!handValue) {
        return null;
    }
    var hasBlackjack = isBlackjack(playerCards) && hasSplit === false;
    var hasBusted = checkForBusted(handValue);
    var isClosed = hasBusted || hasBlackjack || handValue.hi === 21;
    var canDoubleDown = !isClosed && !hasSplit; // [bug fix] cant double down after split
    var canSplit = playerCards.length > 1 && playerCards[0].value === playerCards[1].value && !isClosed;
    var canInsure = dealerCards[0].value === 1 && !isClosed;

    return {
        cards: playerCards,
        playerValue: handValue,
        playerHasBlackjack: hasBlackjack,
        playerHasBusted: hasBusted,
        playerHasSurrendered: false,
        close: isClosed,
        availableActions: {
            double: canDoubleDown,
            split: canSplit,
            insurance: canInsure,
            hit: !isClosed,
            stand: !isClosed,
            surrender: !isClosed
        }
    };
};

var getHandInfoAfterDeal = exports.getHandInfoAfterDeal = function getHandInfoAfterDeal(playerCards, dealerCards, initialBet, playerBalance) {
    var hand = getHandInfo(playerCards, dealerCards);
    hand.bet = initialBet;
    // After deal, even if we got a blackjack the hand cannot be considered closed.
    var availableActions = hand.availableActions;
    if(playerBalance === undefined) playerBalance = Infinity;
    if(playerBalance < initialBet){
        availableActions.double = false;
        availableActions.split = false;
    }
    hand.availableActions = Object.assign({}, availableActions, {
        stand: true,
        hit: true,
        surrender: true
    });
    return Object.assign({}, hand, {
        close: hand.playerHasBlackjack
    });
};

var getHandInfoAfterSplit = exports.getHandInfoAfterSplit = function getHandInfoAfterSplit(playerCards, dealerCards, initialBet) {
    var hand = getHandInfo(playerCards, dealerCards, true);
    var availableActions = hand.availableActions;
    hand.availableActions = Object.assign({}, availableActions, {
        split: false,
        double: !hand.close && playerCards.length === 2 && availableActions.double,
        insurance: false,
        surrender: false
    });
    hand.bet = initialBet;
    return hand;
};

var getHandInfoAfterHit = exports.getHandInfoAfterHit = function getHandInfoAfterHit(playerCards, dealerCards, initialBet, hasSplit, playerBalance) {
    var hand = getHandInfo(playerCards, dealerCards, hasSplit);
    var availableActions = hand.availableActions;
    if(playerBalance === undefined) playerBalance = Infinity;
    if(playerBalance < initialBet){
        availableActions.double = false;
        availableActions.split = false;
    }
    hand.availableActions = Object.assign({}, availableActions, {
        double: playerCards.length === 2,
        split: false,
        insurance: false,
        surrender: false
    });
    hand.bet = initialBet;
    return hand;
};

var getHandInfoAfterDouble = exports.getHandInfoAfterDouble = function getHandInfoAfterDouble(playerCards, dealerCards, initialBet, hasSplit) {
    var hand = getHandInfoAfterHit(playerCards, dealerCards, initialBet, hasSplit);
    var availableActions = hand.availableActions;
    hand.availableActions = Object.assign({}, availableActions, {
        hit: false,
        stand: false
    });
    hand.bet = initialBet * 2;
    return Object.assign({}, hand, {
        close: true
    });
};

var getHandInfoAfterStand = exports.getHandInfoAfterStand = function getHandInfoAfterStand(handInfo) {
    return Object.assign({}, handInfo, {
        close: true,
        availableActions: {
            double: false,
            split: false,
            insurance: false,
            hit: false,
            stand: false,
            surrender: false
        }
    });
};

var getHandInfoAfterSurrender = exports.getHandInfoAfterSurrender = function getHandInfoAfterSurrender(handInfo) {
    var hand = getHandInfoAfterStand(handInfo);
    return Object.assign({}, hand, {
        playerHasSurrendered: true,
        close: true
    });
};

var getHandInfoAfterInsurance = exports.getHandInfoAfterInsurance = function getHandInfoAfterInsurance(playerCards, dealerCards) {
    var hand = getHandInfo(playerCards, dealerCards);
    var availableActions = hand.availableActions;
    hand.availableActions = Object.assign({}, availableActions, {
        stand: true,
        hit: true,
        surrender: true,
        insurance: false
    });
    return Object.assign({}, hand, {
        close: hand.playerHasBlackjack
    });
};

var isLuckyLucky = exports.isLuckyLucky = function isLuckyLucky(playerCards, dealerCards) {
    // Player hand and dealer's up card sum to 19, 20, or 21 ("Lucky Lucky")
    var v1 = calculate(playerCards).hi + calculate(dealerCards).hi;
    var v2 = calculate(playerCards).lo + calculate(dealerCards).lo;
    var v3 = calculate(playerCards).hi + calculate(dealerCards).lo;
    var v4 = calculate(playerCards).lo + calculate(dealerCards).hi;
    return v1 >= 19 && v1 <= 21 || v2 >= 19 && v2 <= 21 || v3 >= 19 && v3 <= 21 || v4 >= 19 && v4 <= 21;
};

var getLuckyLuckyMultiplier = exports.getLuckyLuckyMultiplier = function getLuckyLuckyMultiplier(playerCards, dealerCards) {
    var cards = [].concat(playerCards, dealerCards);
    var isSameSuite = isSuited(cards);
    var flatCards = cards.map(function (x) {
        return x.value;
    }).join('');
    var value = calculate(cards);
    return (0, payout.lucky)(flatCards, isSameSuite, value);
};

var isPerfectPairs = exports.isPerfectPairs = function isPerfectPairs(playerCards) {
    return playerCards[0].value === playerCards[1].value;
};

var getSideBetsInfo = exports.getSideBetsInfo = function getSideBetsInfo(availableBets, sideBets, playerCards, dealerCards) {
    var sideBetsInfo = {
        luckyLucky: 0,
        perfectPairs: 0
    };
    if (availableBets.luckyLucky && sideBets.luckyLucky && isLuckyLucky(playerCards, dealerCards)) {
        var multiplier = getLuckyLuckyMultiplier(playerCards, dealerCards);
        sideBetsInfo.luckyLucky = sideBets.luckyLucky * multiplier;
    }
    if (availableBets.perfectPairs && sideBets.perfectPairs && isPerfectPairs(playerCards)) {
        // TODO: impl colored pairs
        // TODO: impl mixed pairs
        sideBetsInfo.perfectPairs = sideBets.perfectPairs * 5;
    }
    return sideBetsInfo;
};

var isActionAllowed = exports.isActionAllowed = function isActionAllowed(actionName, stage) {
    if (actionName === TYPES.RESTORE) {
        return true;
    }
    switch (stage) {
        case TYPES.STAGE_READY: {
            return [TYPES.RESTORE, TYPES.DEAL].indexOf(actionName) > -1;
        }
        case TYPES.STAGE_PLAYER_TURN_RIGHT: {
            return [TYPES.STAND, TYPES.INSURANCE, TYPES.SURRENDER, TYPES.SPLIT, TYPES.HIT, TYPES.DOUBLE].indexOf(actionName) > -1;
        }
        case TYPES.STAGE_PLAYER_TURN_LEFT: {
            return [TYPES.STAND, TYPES.HIT, TYPES.DOUBLE].indexOf(actionName) > -1;
        }
        case TYPES.SHOWDOWN: {
            return [TYPES.SHOWDOWN, TYPES.STAND].indexOf(actionName) > -1;
        }
        case TYPES.STAGE_DEALER_TURN: {
            return [TYPES.DEALER_HIT].indexOf(actionName) > -1;
        }
        default: {
            return false;
        }
    }
};

var getPrize = exports.getPrize = function getPrize(playerHand, dealerCards) {
    var _playerHand$close = playerHand.close,
        close = _playerHand$close === undefined ? false : _playerHand$close,
        _playerHand$playerHas = playerHand.playerHasSurrendered,
        playerHasSurrendered = _playerHand$playerHas === undefined ? true : _playerHand$playerHas,
        _playerHand$playerHas2 = playerHand.playerHasBlackjack,
        playerHasBlackjack = _playerHand$playerHas2 === undefined ? false : _playerHand$playerHas2,
        _playerHand$playerHas3 = playerHand.playerHasBusted,
        playerHasBusted = _playerHand$playerHas3 === undefined ? true : _playerHand$playerHas3,
        _playerHand$playerVal = playerHand.playerValue,
        playerValue = _playerHand$playerVal === undefined ? {} : _playerHand$playerVal,
        _playerHand$bet = playerHand.bet,
        bet = _playerHand$bet === undefined ? 0 : _playerHand$bet;


    var multiply = 1;
    var higherValidDealerValue = getHigherValidValue(calculate(dealerCards));
    var dealerHasBlackjack = isBlackjack(dealerCards);
    if (!close) {
        return 0;
    }
    if (playerHasBusted) {
        return 0;
    }
    if (playerHasSurrendered) {
        return bet / 2;
    }
    if (playerHasBlackjack && !dealerHasBlackjack) {
        multiply = payout.won(playerHasBlackjack);
        return bet * multiply;
    }
    var dealerHasBusted = higherValidDealerValue > 21;
    if (dealerHasBusted) {
        multiply = payout.won();
        return bet * multiply;
    }
    var higherValidPlayerValue = getHigherValidValue(playerValue);
    if (higherValidPlayerValue > higherValidDealerValue) {
        multiply = payout.won();
        return bet * multiply;
    } else if (higherValidPlayerValue === higherValidDealerValue) {
        return bet; // tie
    }
    return 0;
};

var getPrizes = exports.getPrizes = function getPrizes(_ref) {
    var history = _ref.history,
        _ref$handInfo = _ref.handInfo,
        left = _ref$handInfo.left,
        right = _ref$handInfo.right,
        dealerCards = _ref.dealerCards;

    var finalBet = history.reduce(function (memo, x) {
        memo += x.value;
        return memo;
    }, 0);
    var wonOnRight = getPrize(right, dealerCards);
    var wonOnLeft = getPrize(left, dealerCards);
    return {
        finalBet: finalBet,
        wonOnRight: wonOnRight,
        wonOnLeft: wonOnLeft
    };
};

module.exports = exports;