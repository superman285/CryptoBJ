"use strict";

var TYPES = require('./constants');
var engine = require('./engine');
var _presets = require('./rules');
var actions = require('./actions');

var DEALER_BLACKJACK_ON_FIRST_TURN = {
    ENABLED : true, // if false, if dealer has blackjack its not shown and player can do actions
    FIRST_CARD: '10', // if ENABLED === true then first card must be either '10', '1' or 'any' - for dealer to auto win
}

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }

    return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var appendEpoch = function appendEpoch(obj) {
    var _obj$payload = obj.payload,
        payload = _obj$payload === undefined ? {bet: 0} : _obj$payload;

    return Object.assign({}, obj, {
        value: payload.bet || 0,
        ts: new Date().getTime()
    });
};

var Game = function () {
    function Game(initialState) {
        var rules = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (0, _presets.getRules)({});

        _classCallCheck(this, Game);

        this.state = {};

        this.state = initialState ? Object.assign({}, initialState) : (0, _presets.defaultState)(rules);
        this.dispatch = this.dispatch.bind(this);
        this.getState = this.getState.bind(this);
        this.setState = this.setState.bind(this);
        this.enforceRules = this.enforceRules.bind(this);
        this._dispatch = this._dispatch.bind(this);
    }

    _createClass(Game, [{
        key: 'canDouble',
        value: function canDouble(double, playerValue) {
            if (double === 'none') {
                return false;
            } else if (double === '9or10') {
                return playerValue.hi === 9 || playerValue.hi === 10;
            } else if (double === '9or10or11') {
                return playerValue.hi >= 9 && playerValue.hi <= 11;
            } else if (double === '9thru15') {
                return playerValue.hi >= 9 && playerValue.hi <= 15;
            } else {
                return true;
            }
        }
    }, {
        key: 'enforceRules',
        value: function enforceRules(handInfo) {
            var availableActions = handInfo.availableActions;
            var playerValue = handInfo.playerValue;
            var _state = this.state,
                rules = _state.rules,
                history = _state.history;

            if (!this.canDouble(rules.double, playerValue)) {
                availableActions.double = false;
            }
            if (!rules.split) {
                availableActions.split = false;
            }
            if (!rules.surrender) {
                availableActions.surrender = false;
            }
            if (!rules.doubleAfterSplit) {
                if (history.some(function (x) {
                        return x.type === TYPES.SPLIT;
                    })) {
                    availableActions.double = false;
                }
            }
            if (!rules.insurance) {
                availableActions.insurance = false;
            }
            return handInfo;
        }
    }, {
        key: 'getState',
        value: function getState() {
            return Object.assign({}, this.state);
        }
    }, {
        key: 'setState',
        value: function setState(state) {
            this.state = Object.assign({}, this.state, state);
        }
    }, {
        key: 'dispatch',
        value: function dispatch(action) {
            var _state2 = this.state,
                stage = _state2.stage,
                handInfo = _state2.handInfo,
                history = _state2.history;

            var type = action.type,
                _action$payload = action.payload,
                payload = _action$payload === undefined ? {} : _action$payload;
            var _payload$position = payload.position,
                position = _payload$position === undefined ? TYPES.RIGHT : _payload$position;

            var isLeft = position === TYPES.LEFT;
            var historyHasSplit = history.some(function (x) {
                return x.type === TYPES.SPLIT;
            });
            var hand = handInfo[position];

            var isActionAllowed = engine.isActionAllowed(type, stage);

            if (!isActionAllowed) {
                return this._dispatch(actions.invalid(action, type + ' is not allowed when stage is ' + stage));
            }

            var whiteList = [TYPES.RESTORE, TYPES.DEAL, TYPES.SHOWDOWN];

            if (isActionAllowed && whiteList.some(function (x) {
                    return x === type;
                })) {
                // this is a safe action. We do not need to check the status of the stage
                // so we return the result now!
                if (type === TYPES.DEAL && typeof payload.bet !== 'number') {
                    return this._dispatch(actions.invalid(action, type + ' without bet value on stage ' + stage));
                }
                return this._dispatch(action);
            }

            if (hand.close) {
                // TODO: consolidate this one, probably is just enough to consider the availableActions (see more below)
                return this._dispatch(actions.invalid(action, type + ' is not allowed because "' + position + '" side of the table is closed on "' + stage + '"'));
            }

            if (isLeft && !historyHasSplit) {
                // You want to do something on "left" but no split found in history.
                // default side is "right". When an action want to edit the "left" side of the table
                // a valid split should be appear in the history. If not, "left" position is not ready to be changed
                if (!history.some(function (x) {
                        return x.type === TYPES.SPLIT;
                    })) {
                    return this._dispatch(actions.invalid(action, type + ' is not allowed because there is no SPLIT in current stage "' + stage + '"'));
                }
            }

            if (isLeft && !handInfo.right.close) {
                // You want to do something on "left" but "right" is still open
                return this._dispatch(actions.invalid(action, type + ' is not allowed because you need to finish "left" hand "' + stage + '"'));
            }

            if (!hand.availableActions[type.toLowerCase()]) {
                return this._dispatch(actions.invalid(action, type + ' is not currently allowed on position "' + position + '". Stage is "' + stage + '"'));
            }

            return this._dispatch(action);
        }
    }, {
        key: '_dispatch',
        value: function _dispatch(action) {
            switch (action.type) {
                case TYPES.DEAL: {
                    var _action$payload2 = action.payload,
                        bet = _action$payload2.bet,
                        sideBets = _action$payload2.sideBets;
                    var _state3 = this.state,
                        insurance = _state3.rules.insurance,
                        availableBets = _state3.availableBets,
                        history = _state3.history,
                        hits = _state3.hits;

                    var playerCards = this.state.deck.splice(this.state.deck.length - 2, 2);
                    var dealerCards = this.state.deck.splice(this.state.deck.length - 1, 1);
                    var dealerHoleCard = this.state.deck.splice(this.state.deck.length - 1, 1)[0];
                    var dealerValue = engine.calculate(dealerCards);
                    var dealerHasBlackjack = false;

                    // this only triggers on first turn
                    if(DEALER_BLACKJACK_ON_FIRST_TURN.ENABLED){
                        var _dealerCards = dealerCards.concat([dealerHoleCard]);
                        var _dealerBlackjack = engine.isBlackjack(_dealerCards);
                        if(_dealerBlackjack){ // if dealer has blackjack on first turn, then check if any card composition is allowed
                            switch(DEALER_BLACKJACK_ON_FIRST_TURN.FIRST_CARD){ // first card must be..
                                case '1':   if( ! engine.firstCardOnDeck(1, _dealerCards)) _dealerBlackjack = false; // dealer must have 1 (ace) as first card to end game
                                    break;
                                case '10':  if( ! engine.firstCardOnDeck(10, _dealerCards)) _dealerBlackjack = false; // daler must have 10s as first card to end game
                                    break;
                                case 'any': // dealer blackjack enabled when first card is either 1 (ace) or 10s
                                    break;
                            }
                            dealerHasBlackjack = _dealerBlackjack;
                        }
                    }

                    var right = this.enforceRules(engine.getHandInfoAfterDeal(playerCards, dealerCards, bet, action.balance));
                    if (insurance && dealerValue.lo === 1) {
                        dealerHasBlackjack = false;
                        right.availableActions = Object.assign({}, right.availableActions, {
                            stand: false,
                            double: false,
                            hit: false,
                            split: false,
                            surrender: false
                        });
                    }
                    var sideBetsInfo = engine.getSideBetsInfo(availableBets, sideBets, playerCards, dealerCards);
                    var historyItem = appendEpoch(Object.assign({}, action, {
                        right: playerCards,
                        dealerCards: dealerCards
                    }));
                    this.setState({
                        initialBet: bet,
                        stage: TYPES.STAGE_PLAYER_TURN_RIGHT,
                        dealerCards: dealerCards,
                        dealerHoleCard: dealerHoleCard,
                        dealerValue: dealerValue,
                        dealerHasBlackjack: dealerHasBlackjack,
                        deck: this.state.deck.filter(function (x) {
                            return dealerCards.concat(playerCards).indexOf(x) === -1;
                        }),
                        cardCount: engine.countCards(playerCards.concat(dealerCards)),
                        handInfo: {
                            left: {},
                            right: right
                        },
                        sideBetsInfo: sideBetsInfo,
                        availableBets: (0, _presets.getDefaultSideBets)(false),
                        history: history.concat(historyItem),
                        hits: hits + 1
                    });

                    if (right.playerHasBlackjack) {
                        // purpose of the game archived !!!
                        this._dispatch(actions.showdown());
                        break;
                    }

                    if (dealerHasBlackjack) {
                        if (!right.availableActions.insurance) {
                            // nothing left, let's go and tell the customer he loses this game
                            this._dispatch(actions.showdown());
                        }
                        // else
                        // in this case, the game must continue in "player-turn-right"
                        // waiting for the insurance action
                    }
                    break;
                }
                case TYPES.INSURANCE: {
                    var _action$payload$bet = action.payload.bet,
                        _bet = _action$payload$bet === undefined ? 0 : _action$payload$bet;

                    var _state4 = this.state,
                        _sideBetsInfo = _state4.sideBetsInfo,
                        handInfo = _state4.handInfo,
                        _dealerCards = _state4.dealerCards,
                        _dealerHoleCard = _state4.dealerHoleCard,
                        initialBet = _state4.initialBet,
                        _history = _state4.history,
                        _hits = _state4.hits;

                    var _dealerHasBlackjack = engine.isBlackjack(_dealerCards.concat([_dealerHoleCard]));
                    var insuranceValue = _bet > 0 ? initialBet / 2 : 0;
                    var isFirstCardAce = _dealerCards[0].value === 1;
                    var insurancePrize = isFirstCardAce && _dealerHasBlackjack && insuranceValue > 0 && _bet > 0 ? insuranceValue * 3 : 0;
                    var _right = this.enforceRules(engine.getHandInfoAfterInsurance(handInfo.right.cards, _dealerCards));
                    _right.bet = initialBet;
                    _right.close = _dealerHasBlackjack;
                    var _historyItem = appendEpoch(Object.assign({}, action, {
                        payload: {bet: insuranceValue || 0}
                    }));
                    this.setState({
                        handInfo: {left: {}, right: _right},
                        history: _history.concat(_historyItem),
                        hits: _hits + 1,
                        sideBetsInfo: Object.assign({}, _sideBetsInfo, {
                            insurance: {
                                risk: insuranceValue,
                                win: insurancePrize
                            }
                        })
                    });
                    if (_dealerHasBlackjack) {
                        this._dispatch(actions.showdown());
                    }
                    break;
                }
                case TYPES.SPLIT: {
                    var _state5 = this.state,
                        rules = _state5.rules,
                        _initialBet = _state5.initialBet,
                        _handInfo = _state5.handInfo,
                        _dealerCards2 = _state5.dealerCards,
                        _history2 = _state5.history,
                        _hits2 = _state5.hits;

                    var deck = this.state.deck;
                    var playerCardsLeftPosition = [_handInfo.right.cards[0]];
                    var playerCardsRightPosition = [_handInfo.right.cards[1]];
                    var forceShowdown = rules.showdownAfterAceSplit && playerCardsRightPosition[0].value === 1;
                    var cardRight = deck.splice(deck.length - 2, 1);
                    var cardLeft = deck.splice(deck.length - 1, 1);
                    deck = deck.filter(function (x) {
                        return [cardLeft, cardRight].indexOf(x) === -1;
                    });
                    playerCardsLeftPosition.push(cardLeft[0]);
                    playerCardsRightPosition.push(cardRight[0]);
                    var _historyItem2 = appendEpoch(Object.assign({}, action, {
                        payload: {bet: _initialBet},
                        left: playerCardsLeftPosition,
                        right: playerCardsRightPosition
                    }));
                    var left = this.enforceRules(engine.getHandInfoAfterSplit(playerCardsLeftPosition, _dealerCards2, _initialBet));
                    var _right2 = this.enforceRules(engine.getHandInfoAfterSplit(playerCardsRightPosition, _dealerCards2, _initialBet));
                    var stage = '';
                    if (forceShowdown) {
                        stage = TYPES.STAGE_SHOWDOWN;
                        left.close = true;
                        _right2.close = true;
                    } else {
                        if (_right2.close) {
                            stage = TYPES.STAGE_PLAYER_TURN_LEFT;
                        } else {
                            stage = TYPES.STAGE_PLAYER_TURN_RIGHT;
                        }
                    }
                    if (_right2.close && left.close) {
                        stage = TYPES.STAGE_SHOWDOWN;
                    }
                    this.setState({
                        stage: stage,
                        handInfo: {
                            left: left,
                            right: _right2
                        },
                        deck: deck,
                        history: _history2.concat(_historyItem2),
                        hits: _hits2 + 1
                    });
                    if (stage === TYPES.STAGE_SHOWDOWN) {
                        this._dispatch(actions.showdown());
                    }
                    break;
                }
                case TYPES.HIT: {
                    var _stage = '';
                    var _state6 = this.state,
                        _initialBet2 = _state6.initialBet,
                        _deck = _state6.deck,
                        _handInfo2 = _state6.handInfo,
                        _dealerCards3 = _state6.dealerCards,
                        cardCount = _state6.cardCount,
                        _history3 = _state6.history,
                        _hits3 = _state6.hits;

                    var position = action.payload.position;
                    var card = _deck.splice(_deck.length - 1, 1);
                    var _playerCards = [];
                    var _left = {};
                    var _right3 = {};
                    var hasSplit = _history3.some(function (x) {
                        return x.type === TYPES.SPLIT;
                    });
                    if (position === TYPES.LEFT) {
                        _playerCards = _handInfo2.left.cards.concat(card);
                        _left = engine.getHandInfoAfterHit(_playerCards, _dealerCards3, _initialBet2, hasSplit, action.balance);
                        _right3 = Object.assign({}, _handInfo2.right);
                        if (_left.close) {
                            _stage = TYPES.STAGE_SHOWDOWN;
                        } else {
                            _stage = 'player-turn-' + position;
                        }
                    } else {
                        _playerCards = _handInfo2.right.cards.concat(card);
                        _right3 = engine.getHandInfoAfterHit(_playerCards, _dealerCards3, _initialBet2, hasSplit, action.balance);
                        _left = Object.assign({}, _handInfo2.left);
                        if (_right3.close) {
                            if (_history3.some(function (x) {
                                    return x.type === TYPES.SPLIT;
                                })) {
                                _stage = TYPES.STAGE_PLAYER_TURN_LEFT;
                            } else {
                                _stage = TYPES.STAGE_SHOWDOWN;
                            }
                        } else {
                            _stage = 'player-turn-' + position;
                        }
                        if (_right3.close && _left.close) {
                            _stage = TYPES.STAGE_SHOWDOWN;
                        }
                    }
                    var objCards = {};
                    objCards[position] = _playerCards;
                    var _historyItem3 = appendEpoch(Object.assign({}, action, objCards));
                    this.setState({
                        stage: _stage,
                        handInfo: {left: _left, right: _right3},
                        deck: _deck.filter(function (x) {
                            return _playerCards.indexOf(x) === -1;
                        }),
                        cardCount: cardCount + engine.countCards(card),
                        history: _history3.concat(_historyItem3),
                        hits: _hits3 + 1
                    });
                    if (_stage === TYPES.STAGE_SHOWDOWN) {
                        this._dispatch(actions.showdown());
                    }
                    break;
                }
                case TYPES.DOUBLE: {
                    var _stage2 = '';
                    var _state7 = this.state,
                        _initialBet3 = _state7.initialBet,
                        _deck2 = _state7.deck,
                        _handInfo3 = _state7.handInfo,
                        _dealerCards4 = _state7.dealerCards,
                        _cardCount = _state7.cardCount,
                        _history4 = _state7.history,
                        _hits4 = _state7.hits;

                    var _position = action.payload.position;
                    var _card = _deck2.splice(_deck2.length - 1, 1);
                    var _playerCards2 = [];
                    var _left2 = {};
                    var _right4 = {};
                    var _hasSplit = _history4.some(function (x) {
                        return x.type === TYPES.SPLIT;
                    });
                    // TODO: remove position and replace it with stage info #hit
                    if (_position === TYPES.LEFT) {
                        _right4 = Object.assign({}, _handInfo3.right);
                        _playerCards2 = _handInfo3.left.cards.concat(_card);
                        _left2 = engine.getHandInfoAfterDouble(_playerCards2, _dealerCards4, _initialBet3, _hasSplit);
                        if (_left2.close) {
                            _stage2 = TYPES.STAGE_SHOWDOWN;
                        } else {
                            _stage2 = 'player-turn-' + _position;
                        }
                    } else {
                        _playerCards2 = _handInfo3.right.cards.concat(_card);
                        _left2 = Object.assign({}, _handInfo3.left);
                        _right4 = engine.getHandInfoAfterDouble(_playerCards2, _dealerCards4, _initialBet3, _hasSplit);
                        if (_right4.close) {
                            if (_history4.some(function (x) {
                                    return x.type === TYPES.SPLIT;
                                })) {
                                _stage2 = TYPES.STAGE_PLAYER_TURN_LEFT;
                            } else {
                                _stage2 = TYPES.STAGE_SHOWDOWN;
                            }
                        } else {
                            _stage2 = 'player-turn-' + _position;
                        }
                    }
                    var _objCards = {};
                    _objCards[_position] = _playerCards2;
                    var _historyItem4 = appendEpoch(Object.assign({}, action, {
                        payload: {bet: _initialBet3}
                    }, _objCards));
                    this.setState({
                        stage: _stage2,
                        handInfo: {left: _left2, right: _right4},
                        deck: _deck2.filter(function (x) {
                            return _playerCards2.indexOf(x) === -1;
                        }),
                        cardCount: _cardCount + engine.countCards(_card),
                        history: _history4.concat(_historyItem4),
                        hits: _hits4 + 1
                    });
                    this._dispatch(actions.stand(_position));
                    break;
                }
                case TYPES.STAND: {
                    var _stage3 = '';
                    var _state8 = this.state,
                        _handInfo4 = _state8.handInfo,
                        _history5 = _state8.history,
                        _hits5 = _state8.hits;

                    var _position2 = action.payload.position;
                    var _left3 = {};
                    var _right5 = {};
                    var _hasSplit2 = _history5.some(function (x) {
                        return x.type === TYPES.SPLIT;
                    });
                    if (_position2 === TYPES.LEFT) {
                        _right5 = Object.assign({}, _handInfo4.right);
                        _left3 = engine.getHandInfoAfterStand(_handInfo4.left);
                        _stage3 = TYPES.STAGE_SHOWDOWN;
                    }
                    if (_position2 === TYPES.RIGHT) {
                        _left3 = Object.assign({}, _handInfo4.left);
                        _right5 = engine.getHandInfoAfterStand(_handInfo4.right);
                        if (_right5.close) {
                            _stage3 = TYPES.STAGE_SHOWDOWN;
                        }
                    }
                    if (_hasSplit2) {
                        _stage3 = _stage3 !== TYPES.STAGE_SHOWDOWN ? TYPES.STAGE_PLAYER_TURN_LEFT : TYPES.STAGE_SHOWDOWN;
                    }
                    if (_hasSplit2 && !_left3.close) {
                        _stage3 = TYPES.STAGE_PLAYER_TURN_LEFT;
                    }
                    var _historyItem5 = appendEpoch(action);
                    this.setState({
                        stage: _stage3,
                        handInfo: {left: _left3, right: _right5},
                        history: _history5.concat(_historyItem5),
                        hits: _hits5 + 1
                    });
                    if (_stage3 === TYPES.STAGE_SHOWDOWN) {
                        this._dispatch(actions.showdown());
                    }
                    break;
                }
                case TYPES.SHOWDOWN: {
                    var _state9 = this.state,
                        _dealerHoleCard2 = _state9.dealerHoleCard,
                        _handInfo5 = _state9.handInfo,
                        _history6 = _state9.history,
                        _hits6 = _state9.hits;
                    var dealerHoleCardOnly = action.payload.dealerHoleCardOnly;

                    var _historyItem6 = appendEpoch(action);
                    this.setState({
                        stage: TYPES.STAGE_DEALER_TURN,
                        history: _history6.concat(_historyItem6),
                        hits: _hits6 + 1
                    });
                    // we want to include in the calculation the dealerHoleCard obtained in initial deal()
                    this._dispatch(actions.dealerHit({dealerHoleCard: _dealerHoleCard2}));
                    if (dealerHoleCardOnly) {
                        this.setState(Object.assign({
                            stage: TYPES.STAGE_DONE
                        }, engine.getPrizes(this.state)));
                        break;
                    }
                    var checkLeftStatus = _history6.some(function (x) {
                        return x.type === TYPES.SPLIT;
                    });
                    var check1 = (_handInfo5.right.playerHasBusted || _handInfo5.right.playerHasBlackjack) && !checkLeftStatus;
                    if (check1) {
                        this.setState(Object.assign({
                            stage: TYPES.STAGE_DONE
                        }, engine.getPrizes(this.state)));
                        break;
                    }
                    var check2 = checkLeftStatus && (_handInfo5.left.playerHasBusted || _handInfo5.left.playerHasBlackjack) && check1;
                    if (check2) {
                        this.setState(Object.assign({
                            stage: TYPES.STAGE_DONE
                        }, engine.getPrizes(this.state)));
                        break;
                    }
                    if (checkLeftStatus && _handInfo5.left.playerHasBusted && _handInfo5.right.playerHasBusted) {
                        this.setState(Object.assign({
                            stage: TYPES.STAGE_DONE
                        }, engine.getPrizes(this.state)));
                        break;
                    }
                    while (this.getState().stage === TYPES.STAGE_DEALER_TURN) {
                        this._dispatch(actions.dealerHit());
                    }
                    this.setState(Object.assign({}, engine.getPrizes(this.state)));
                    break;
                }
                case TYPES.SURRENDER: {
                    var _state10 = this.state,
                        _handInfo6 = _state10.handInfo,
                        _history7 = _state10.history,
                        _hits7 = _state10.hits;

                    _handInfo6.right = engine.getHandInfoAfterSurrender(_handInfo6.right);
                    var _historyItem7 = appendEpoch(action);
                    this.setState({
                        stage: TYPES.STAGE_SHOWDOWN,
                        handInfo: _handInfo6,
                        history: _history7.concat(_historyItem7),
                        hits: _hits7 + 1
                    });
                    this._dispatch(actions.showdown({dealerHoleCardOnly: true}));
                    break;
                }
                case TYPES.DEALER_HIT: {
                    var _state11 = this.state,
                        _rules = _state11.rules,
                        _deck3 = _state11.deck,
                        _cardCount2 = _state11.cardCount,
                        _history8 = _state11.history,
                        _hits8 = _state11.hits;
                    // the new card for dealer can be the "dealerHoleCard" or a new card
                    // dealerHoleCard was set at the deal()

                    var _dealerHoleCard3 = action.payload.dealerHoleCard;

                    var _card2 = _dealerHoleCard3 || _deck3.splice(_deck3.length - 1, 1)[0];
                    var _dealerCards5 = this.state.dealerCards.concat([_card2]);
                    var _dealerValue = engine.calculate(_dealerCards5);
                    var _dealerHasBlackjack2 = engine.isBlackjack(_dealerCards5);
                    var dealerHasBusted = _dealerValue.hi > 21;
                    var _stage4 = null;
                    if (_dealerValue.hi < 17) {
                        _stage4 = TYPES.STAGE_DEALER_TURN;
                    } else {
                        if (!_rules.standOnSoft17 && engine.isSoftHand(_dealerCards5)) {
                            _stage4 = TYPES.STAGE_DEALER_TURN;
                        } else {
                            _stage4 = TYPES.STAGE_DONE;
                        }
                    }
                    var _historyItem8 = appendEpoch(Object.assign({}, action, {
                        dealerCards: _dealerCards5
                    }));
                    this.setState({
                        stage: _stage4,
                        dealerCards: _dealerCards5,
                        dealerValue: _dealerValue,
                        dealerHasBlackjack: _dealerHasBlackjack2,
                        dealerHasBusted: dealerHasBusted,
                        deck: _deck3.filter(function (x) {
                            return _dealerCards5.indexOf(x) === -1;
                        }),
                        cardCount: _cardCount2 + engine.countCards([_card2]),
                        history: _history8.concat(_historyItem8),
                        hits: _hits8 + 1
                    });
                    break;
                }
                default: {
                    var _state12 = this.state,
                        _history9 = _state12.history,
                        _hits9 = _state12.hits;

                    var _historyItem9 = appendEpoch(action);
                    this.setState({
                        hits: _hits9 + 1,
                        history: _history9.concat(_historyItem9)
                    });
                    break;
                }
            }
            return this.getState();
        }
    }]);

    return Game;
}();

exports.default = Game;