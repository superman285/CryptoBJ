"use strict";

var TYPES = require('./constants');

exports.dealerHit = exports.showdown = exports.surrender = exports.stand = exports.double = exports.hit = exports.split = exports.insurance = exports.deal = exports.restore = exports.invalid = undefined;

var invalid = exports.invalid = function invalid(action, info) {
    return {
        type: TYPES.INVALID,
        payload: {
            type: action.type,
            payload: action.payload,
            info: info
        }
    };
};

var restore = exports.restore = function restore() {
    return {
        type: TYPES.RESTORE
    };
};

var deal = exports.deal = function deal() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$bet = _ref.bet,
        bet = _ref$bet === undefined ? 10 : _ref$bet,
        _ref$sideBets = _ref.sideBets,
        sideBets = _ref$sideBets === undefined ? {luckyLucky: 0} : _ref$sideBets;

    return {
        type: TYPES.DEAL,
        payload: {
            bet: bet,
            sideBets: sideBets
        },
        balance: _ref.balance !== undefined ? _ref.balance : Infinity,
    };
};

var insurance = exports.insurance = function insurance(_ref2) {
    var _ref2$bet = _ref2.bet,
        bet = _ref2$bet === undefined ? 0 : _ref2$bet;

    return {
        type: TYPES.INSURANCE,
        payload: {
            bet: bet
        }
    };
};

var split = exports.split = function split() {
    return {
        type: TYPES.SPLIT,
    };
};

var hit = exports.hit = function hit(_ref3) {
    var _ref3$position = _ref3.position,
        position = _ref3$position === undefined ? 'right' : _ref3$position;

    return {
        type: TYPES.HIT,
        payload: {
            position: position
        },
        balance: _ref3.balance !== undefined ? _ref3.balance : Infinity,
    };
};

var double = exports.double = function double(_ref4) {
    var _ref4$position = _ref4.position,
        position = _ref4$position === undefined ? 'right' : _ref4$position;

    return {
        type: TYPES.DOUBLE,
        payload: {
            position: position
        }
    };
};

var stand = exports.stand = function stand(_ref5) {
    var _ref5$position = _ref5.position,
        position = _ref5$position === undefined ? 'right' : _ref5$position;

    return {
        type: TYPES.STAND,
        payload: {
            position: position
        }
    };
};

var surrender = exports.surrender = function surrender() {
    return {
        type: TYPES.SURRENDER
    };
};

var showdown = exports.showdown = function showdown() {
    var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref6$dealerHoleCardO = _ref6.dealerHoleCardOnly,
        dealerHoleCardOnly = _ref6$dealerHoleCardO === undefined ? false : _ref6$dealerHoleCardO;

    return {
        type: TYPES.SHOWDOWN,
        payload: {
            dealerHoleCardOnly: dealerHoleCardOnly
        }
    };
};

var dealerHit = exports.dealerHit = function dealerHit() {
    var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        dealerHoleCard = _ref7.dealerHoleCard;

    return {
        type: TYPES.DEALER_HIT,
        payload: {
            dealerHoleCard: dealerHoleCard
        }
    };
};

module.exports = exports;