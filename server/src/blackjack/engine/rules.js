"use strict";

var MINIMUM_BET = 10;
var MAXIMUM_BET = 10000;
var STAND_ON_SOFT_17 = false; // boolean, true or false
var NUMBER_OF_DECKS = 1; // integer
var DOUBLE_ON = 'any'; // valid values: 'none', 'any', '9or10', '9or10or11', '9thru15'
var SPLIT_ENABLED = true; // boolean

var TYPES = require('./constants');
var _deck = require('./deck');

exports.defaultState = exports.getRules = exports.getDefaultSideBets = undefined;

var getDefaultSideBets = exports.getDefaultSideBets = function getDefaultSideBets() {
    var active = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    return {
        luckyLucky: active,
        perfectPairs: active,
        royalMatch: active,
        luckyLadies: active,
        inBet: active,
        MatchTheDealer: active
    };
};

var getRules = exports.getRules = function getRules(_ref) {

    var _ref$decks = _ref.decks,
        decks = _ref$decks === undefined ? NUMBER_OF_DECKS : _ref$decks,

        _ref$standOnSoft17 = _ref.standOnSoft17,
        standOnSoft17 = _ref$standOnSoft17 === undefined ? STAND_ON_SOFT_17 : _ref$standOnSoft17,

        _ref$double = _ref.double,
        double = _ref$double === undefined ? DOUBLE_ON : _ref$double,

        _ref$split = _ref.split,
        split = _ref$split === undefined ? SPLIT_ENABLED : _ref$split,

        _ref$doubleAfterSplit = _ref.doubleAfterSplit,
        doubleAfterSplit = _ref$doubleAfterSplit === undefined ? false : _ref$doubleAfterSplit,

        _ref$surrender = _ref.surrender,
        surrender = _ref$surrender === undefined ? false : _ref$surrender,

        _ref$insurance = _ref.insurance,
        insurance = _ref$insurance === undefined ? false : _ref$insurance,

        _ref$showdownAfterAce = _ref.showdownAfterAceSplit,
        showdownAfterAceSplit = _ref$showdownAfterAce === undefined ? false : _ref$showdownAfterAce,

        _ref$minimumBet = _ref.minimumBet,
        minimumBet = _ref$minimumBet === undefined ? MINIMUM_BET : _ref$minimumBet,

        _ref$maximumBet = _ref.maximumBet,
        maximumBet = _ref$maximumBet === undefined ? MAXIMUM_BET : _ref$maximumBet;

    return {
        decks: decks || 1,
        standOnSoft17: standOnSoft17,
        double: double,
        split: split,
        doubleAfterSplit: doubleAfterSplit,
        surrender: surrender,
        insurance: insurance,
        showdownAfterAceSplit: showdownAfterAceSplit,
        minimumBet : minimumBet,
        maximumBet : maximumBet,
    };
};

var getFrontRules = exports.getFrontRules = function getFrontRules(customRules){

    var rules = getRules(customRules);

    return {
        double: rules.double,
        split: rules.split,
        minimumBet : rules.minimumBet,
        maximumBet : rules.maximumBet,
    };

}

var defaultState = exports.defaultState = function defaultState(rules) {
    return {
        hits: 0,
        initialBet: 0,
        finalBet: 0,
        finalWin: 0,
        wonOnRight: 0,
        wonOnLeft: 0,
        stage: TYPES.STAGE_READY,
        deck: (0, _deck.shuffle)((0, _deck.newDecks)(rules.decks)),
        handInfo: {
            left: {},
            right: {}
        },
        history: [],
        availableBets: getDefaultSideBets(true),
        sideBetsInfo: {},
        rules: rules,
        dealerHoleCard: null,
        dealerHasBlackjack: false,
        dealerHasBusted: false
    };
};

module.exports = exports;