// @flow
// eslint-disable-line no-unused-vars
import Button from '../components/common/Button';
// import Card from "../components/blackjack/Card";
import Cards from '../components/blackjack/Cards';
import Coins from '../components/blackjack/Coins';
import CoinsDealer from '../components/blackjack/CoinsDealer';
import io from 'socket.io-client';
import * as constants from '../constants.js';
import { TimelineLite } from 'gsap'; //  eslint-disable-line no-unused-vars
import * as sound from '../components/blackjack/sounds';
import { cheats } from '../components/blackjack/cheats'; // TODO - this should be removed in live version
import { mapActions, mapGetters, mapState } from 'vuex';


let ENABLED_COINS = [10, 25, 100, 500];

let errorNotification = msg => {
    alert(msg); // you may want to change this to something nicer
};

export default {
    name: 'blackjack',
    components: {
        Button,
        Cards,
        Coins,
        CoinsDealer,
    },
    data() {
        return {
            player: {
                id: null,
                balance: 0, // confirmed from backend
                softBalance: 0, // frontend stuff
            },
            // this is sockets.id and saved in browser local storage; if user closes browser he can continue game later
            socket: io(constants.SOCKETS_PORT),
            game: {
                rounds: 0,
                ready: false,
                busy: false, // animations
                currentAction: null,
                state: {},
                cached: {},
                prepBet: 0,
                lastBet: 0,
                rules: {}, // like minimumBet, maximumBet
                betHistory: [],
                dealerPays: [], // similar to betHistory, for animation when player wins and coins goes from dealer to player
                lastWin: 0,
                animations: { left: [], right: [], dealer: [] }, // 0 - do not show, 1 - show, -1 cover up
                cardValues: {
                    left: 0,
                    right: 0,
                    dealer: 0, // update all these delayed after animations are complete
                },
                currentDelay: 0,
                double: 1,
                clean: false,
            },

            cheats: cheats !== undefined ? cheats : {},

            positions: {},
            customBet: 50,
            // debug
            lastAnimState: 0,

            muted: false,
            introPlayed: false, // plays once upon entering page (not on mobile tho, for that you need to create element for user to click and allow sounds)
        };
    },

    mounted() {
        let vm = this;

        //! page to top on route change
        window.scrollTo(0, 0);

        this.prepareDefaultAnimData();

        // connections established with
        this.socket.on('init', data => {
            console.log('init', data);
            init(data);
        });

        this.socket.on('cheats', data => {
            init(data, () => {
                vm.confirmBet(true);
                vm.animateBet();
                vm.checkGameState();
            });
        });

        this.socket.on('debug', data => {
            console.log('debug', data);
        });

        let init = (data, callback) => {
            if (!vm.introPlayed) {
                vm.introPlayed = true;
                vm.$emit('sound:intro');
            }

            if (vm.game.delayedAction !== undefined) {
                vm.game.delayedAction();
            }

            let syncState = this.syncCardAnimations(data.state);
            vm.game.state = syncState;
            // vm.game.state = data.state;

            if (data.rules) vm.game.rules = data.rules;
            if (data.balance >= 0) {
                vm.player.balance = data.balance;
                vm.player.softBalance = data.balance;
            }
            vm.game.ready = true;
            vm.game.delayedAction = undefined;

            if (callback) callback();
        };

        this.socket.on('action', data => {
            let syncState = this.syncCardAnimations(data.state);
            this.parseIncomingNewData(syncState);
            vm.game.state = syncState;
            vm.updateBalance(data.balance);
            this.checkGameState();
        });

        this.socket.on('update', data => {
            if (data.balance >= 0) {
                vm.player.balance = data.balance;
                vm.player.softBalance = data.balance;
            }
        });

        this.socket.on('bet', data => {
            this.player.balance = data.balance;
            this.player.softBalance = data.balance;
        });

        this.socket.on('game-error', err => {
            console.log('game error', err.message);
            errorNotification('Error occurred: ' + err.message);
            if (this.game.busy) this.game.busy = false;
        });

        this.$on('sound:intro', () => {
            vm.playSound('intro');
        });
        this.$on('sound:win', () => {
            vm.playSound('win');
        });
        this.$on('sound:lose', () => {
            vm.playSound('lose');
        });
        this.$on('sound:tie', () => {
            vm.playSound('tie');
        });
        this.$on('sound:shuffle', () => {
            vm.playSound('shuffle');
        });
    },

    methods: {
        ...mapActions([
            'updateBalance',
            'showModal',
            'showBjTipsModal',
            'showNotEnoughBalanceModal',
            'closeNotEnoughBalanceModal',
            'showLoginModal',
            'closeLoginModal',
            'showLoading',
            'closeLoading',
            'getMyBets',
            'getAllBets',
        ]),
        changeVisibleCardScore(side, score) {
            let value = 0;
            if (score.hi > 21) {
                value = score.lo;
            } else {
                value = score.hi;
            }

            this.game.cardValues[side] = value;
        },

        triggerCheats(params) {
            if (this.game.busy) {
                console.log('game busy', this.game.busy);
                return;
            }

            let vm = this;

            if (params.restart === true && this.game.state.dealerCards !== undefined) {
                this.game.state.stage = 'done';
                this.game.clean = false;
                this.restart(true, () => {
                    vm.socket.emit('cheats', {
                        cheatCode: params.cheatCode,
                    });
                });
            } else {
                this.socket.emit('cheats', {
                    cheatCode: params.cheatCode,
                });
            }
        },

        userAction(actionName) {
            if (this.game.busy) return; // prevent spam on buttons
            if (!this.actionEnabled(actionName)) return;

            this.game.busy = true;
            let prep = this.prepareForNextAction(actionName); //  eslint-disable-line no-unused-vars

            this.game.currentAction = actionName;
            this.gameAction();
        },
        gameAction() {
            // this.game.rounds += 1;

            if (this.gameNeedsToRestart()) {
                let vm = this;
                this.game.delayedAction = () => {
                    return vm.gameAction();
                };
                this.restart();
                return;
            }

            if (this.game.state.position !== 'right' && (this.game.currentAction === 'hit' || this.game.currentAction === 'stand')) {
                this.game.currentAction += 'L';
            }

            this.socket.emit('action', {
                player: this.player,
                payload: {
                    action: this.game.currentAction,
                    position: this.game.state.position,
                },
            });
            this.game.currentAction = null;
        },

        showCoinValueInText() {
            this.$root.$emit('coinsTotalBetVisible', true);
        },

        gameBet(type, amount) {
            if (this.gameNeedsToRestart()) {
                let vm = this;
                this.game.delayedAction = () => {
                    return vm.gameBet(type, amount);
                };
                this.restart();
                return;
            }

            switch (type) {
                case 'inc':
                    this.increaseBet(amount);
                    break;
                case 'set':
                    this.setBet(amount);
                    break;
                case 'double':
                    this.betDouble();
                    break;
                case 'half':
                    this.betHalf();
                    break;
                case 'min':
                    this.betMinimum();
                    break;
                case 'max':
                    this.betMaximum();
                    break;
                case 'repeat':
                    if (this.setBet(this.game.lastBet)) this.confirmBet();
                    break;
                case 'confirm':
                    this.confirmBet();
                    break;
                case 'input':
                    this.betInput();
                    break;
                default:
                    console.log('!! Unknown game bet type', type, amount);
                    break;
            }
        },

        increaseBet(amount) {
            if (!this.canPlaceBets()) {
                console.log('Cant place bets atm', this.game.state.stage);
                return;
            }

            if (this.game.prepBet + amount > this.player.balance) {
                console.log('Balance insufficient #1');
                return;
            }
            if (this.game.prepBet + amount > this.game.rules.maximumBet) {
                console.log('Maximum bet is: ', this.game.rules.maximumBet);
                return;
            }

            this.game.betHistory.push({ value: amount, show: true });
            this.orderBetHistory();

            this.player.softBalance -= amount;
            this.game.prepBet += amount;

            this.showCoinValueInText();
        },
        betInput() {
            this.setBet(this.customBet);
        },
        setBet(bet) {
            if (!this.canPlaceBets()) {
                console.log('Cant place bets atm', this.game.state.stage);
                return false;
            }

            if (parseInt(bet) > this.player.balance) {
                console.log('Balance insufficient #2', bet, this.player.balance);
                errorNotification('Balance insufficient');
                return false;
            }
            if (parseInt(bet) < this.game.rules.minimumBet) {
                console.log('Minimum bet is: ', this.game.rules.minimumBet, 'your bet: ', bet);
                errorNotification('Minimum bet is: ' + this.game.rules.minimumBet);
                return false;
            }
            if (parseInt(bet) > this.game.rules.maximumBet) {
                console.log('Maximum bet is: ', this.game.rules.maximumBet, 'your bet:', bet);
                errorNotification('Minimum bet is: ' + this.game.rules.maximumBet);
                return false;
            }

            this.game.betHistory = [];
            if (this.game.double > 1) {
                // show 2x cols of coin on table
            } else {
                this.newBetHistoryBasedOnCurrentAmount(bet);
            }

            this.player.softBalance = this.player.balance - bet;
            this.game.prepBet = bet;

            this.showCoinValueInText();

            return true;
        },

        newBetHistoryBasedOnCurrentAmount(amount) {
            const coins = ENABLED_COINS.slice().reverse(); // must reverse array, so that biggest coin goes first
            for (let i = 0; i < coins.length; i++) {
                let pieces = Math.floor(amount / coins[i]);
                if (pieces > 0) {
                    amount -= pieces * coins[i];
                    for (let p = 0; p < pieces; p++) {
                        this.game.betHistory.push({ value: coins[i], show: true });
                    }
                }
            }
        },

        orderBetHistory() {
            this.game.betHistory.sort((a, b) => {
                return b.value - a.value;
            });
        },

        betDouble() {
            if (!this.canPlaceBets()) {
                console.log('Cant place bets atm', this.game.state.stage);
                return;
            }
            let doubleBet = this.game.prepBet * 2;
            if (doubleBet <= this.player.balance && doubleBet <= this.game.rules.maximumBet) {
                this.setBet(doubleBet);
            } else {
                console.log('Either bet over maximum allowed or reached limit in balance.');
            }
        },
        betHalf() {
            if (!this.canPlaceBets()) {
                console.log('Cant place bets atm', this.game.state.stage);
                return;
            }
            let desiredHalfBet = parseInt(this.game.prepBet / 2);
            if (desiredHalfBet < this.game.rules.minimumBet) {
                console.log('Cant bet less than a minimum bet');
                return;
            }

            let leftOvers = desiredHalfBet;
            let halfBet = 0;
            let coins = ENABLED_COINS.slice().reverse(); // make sure array goes from highest values first
            for (let i = 0; i < coins.length; i++) {
                let coin = parseInt(coins[i]);
                let pieces = Math.floor(leftOvers / coin);
                if (pieces > 0) {
                    let amount = pieces * coin;
                    halfBet += amount;
                    leftOvers -= amount;
                }
            }

            this.setBet(halfBet);
        },
        betMinimum() {
            this.setBet(parseInt(this.game.rules.minimumBet)); // check inside if possible
        },
        betMaximum() {
            let max = parseInt(this.game.rules.maximumBet);
            if (max > this.player.balance) {
                max = this.player.balance;
            }
            this.setBet(max); // check inside if possible
        },

        repeatBetEnabled() {
            return (this.game.state.stage === 'ready' || this.game.state.stage === 'done') && this.game.lastBet > 0 && !this.game.busy;
        },
        repeatLastBet() {
            if (this.repeatBetEnabled()) {
                this.game.prepBet = this.game.lastBet;
                this.confirmBet();
            }
        },
        confirmBetEnabled() {
            return !this.game.busy && (this.game.state.stage === 'ready' || this.game.currentAction === constants.NEED_RESTART);
        },
        canPlaceBets() {
            return !this.game.busy && (this.game.state.stage === 'ready' || this.game.state.stage === 'done');
        },
        confirmBet(skipEmit) {
            let amount = this.game.prepBet || 10;
            this.game.prepBet = amount;
            this.game.lastBet = amount;

            if (this.game.betHistory.length === 0) {
                this.newBetHistoryBasedOnCurrentAmount(amount);
            }

            if (skipEmit === undefined) {
                this.socket.emit('bet', {
                    player: this.player,
                    amount: amount,
                });
            }

            this.showCoinValueInText();
        },

        actionEnabled(actionName) {
            let position = this.game.state.position;
            if (position === undefined) position = 'right';

            return (
                !this.game.busy &&
                this.game.state.handInfo !== undefined &&
                this.game.state.handInfo[position] &&
                this.game.state.handInfo[position].availableActions &&
                this.game.state.handInfo[position].availableActions[actionName] === true
            );
        },

        // this makes slick split animation
        prepareForNextAction(actionName) {
            if (actionName === 'split') {
                this.$root.$emit('updatePositions');

                // need to make sure that 2nd card on the right is hidden straight away, because it will be changed and animated again

                this.game.animations.right[0] = constants.CARD_STATE_FACE_UP;
                this.game.animations.right[1] = constants.CARD_STATE_HIDDEN;

                this.game.animations.left[0] = constants.CARD_STATE_FACE_UP;
                this.game.animations.left[1] = constants.CARD_STATE_HIDDEN;

                // also move 2nd card on right to 1st card on left (for smooth transition)
                let _first = this.game.state.handInfo.right.cards[0];
                let _second = this.game.state.handInfo.right.cards[1];

                this.game.state.handInfo.left = { cards: [_first] };
                this.game.state.handInfo.right.cards = [_second];

                this.game.hands = 2; // call split animation early
            }

            return true;
        },

        parseIncomingNewData(state) {
            let has = {
                double: false,
                split: false,
            };

            if (state.history !== undefined && state.history.length > 0) {
                for (var i = 0; i < state.history.length; i++) {
                    if (state.history[i].toLowerCase() === 'double') has.double = true;
                    if (state.history[i].toLowerCase() === 'split') has.split = true;
                }
            }

            if (has.double && this.game.double !== 2) this.game.double = 2;

            if (has.split && this.game.hands !== 2) this.game.hands = 2;

            return has;
        },

        checkGameState() {
            let vm = this;

            let checkState = () => {
                if (vm.game.state.stage === 'done') {
                    this.$root.$emit('updatePositions');
                    this.game.clean = false; // need to trigger throw away cards animation

                    this.game.lastWin = parseInt(this.game.state.wonOnLeft) + parseInt(this.game.state.wonOnRight);
                    if (this.game.lastWin > 0 && vm.game.state.tie === false) {
                        vm.clearBoard(constants.PLAYER_WIN);
                    } else if (this.game.lastWin === 0 && vm.game.state.tie === false) {
                        vm.clearBoard(constants.PLAYER_LOSS);
                    } else {
                        vm.clearBoard(constants.PLAYER_TIE);
                    }
                } else {
                    let sides = ['left', 'right'];

                    let hands = 0;
                    for (let i in sides) {
                        if (vm.game.state.handInfo !== undefined && Object.keys(vm.game.state.handInfo[sides[i]]).length > 0) hands++;
                    }
                    vm.game.hands = hands;
                    vm.game.busy = false;
                }
            };

            vm.game.busy = true;
            setTimeout(() => {
                vm.runAnimations(() => {
                    checkState();
                }); // give time for new data to apply and start animations then
            }, 100);
        },

        syncCardAnimations(state) {
            let playerSides = ['right', 'left'];
            for (let s in playerSides) {
                let side = playerSides[s];
                if (this.handHasCards(side, state)) {
                    for (let i in state.handInfo[side].cards) {
                        state.handInfo[side].cards[i].anim = this.game.animations[side][i];
                    }
                }
            }

            // sync dealer cards
            let side = 'dealer';
            for (let i in state.dealerCards) {
                state.dealerCards[i].anim = this.game.animations[side][i];
            }

            return state;
        },

        prepareDefaultAnimData() {
            let anims = this.game.animations;
            let counter = 10;
            for (let side in anims) {
                this.game.animations[side] = [];
                for (let i = 0; i <= counter; i++) {
                    let cardState = 0;
                    this.game.animations[side].push(cardState);
                }
            }
        },

        runAnimations(callback) {
            // optionally with callback

            let vm = this;
            let delay = 100;
            const delayInc = 400;
            const delayInRevealANim = constants.CARD_REVEAL_ANIMATION_SPEED * 1000;
            const delayBeforeStateChange = constants.CARD_REVEAL_ANIMATION_SPEED * 1000 * 0.7;

            let animCard = (_side, _index, _animState, _delay) => {
                setTimeout(() => {
                    vm.setAnimationCardState(_side, _index, _animState);
                }, _delay);
            };
            let playDelayedSound = (soundKey, _delay) => {
                setTimeout(() => {
                    vm.$emit('sound:' + soundKey);
                }, _delay);
            };
            let changeVisibleCardScoreWithDelay = (_value, _side, _delay) => {
                setTimeout(() => {
                    vm.changeVisibleCardScore(_side, _value);
                }, _delay);
            };

            // player cards
            for (let side in this.game.state.handInfo) {
                if (this.handHasCards(side)) {
                    for (let i = 0; i < this.game.state.handInfo[side].cards.length; i++) {
                        if (this.game.state.handInfo[side].cards[i].anim === 0) {
                            animCard(side, i, constants.CARD_STATE_FACE_DOWN, delay);
                            animCard(side, i, constants.CARD_STATE_FACE_UP, delay + delayBeforeStateChange);
                            playDelayedSound('shuffle', delay);
                            delay += delayInc;
                        }
                    }

                    changeVisibleCardScoreWithDelay(this.game.state.handInfo[side].playerValue, side, delay - delayInc + delayInRevealANim);
                }
            }

            // dealer carsd
            let side = 'dealer';

            if (this.game.state.dealerCards !== undefined) {
                for (let i = 0; i < this.game.state.dealerCards.length; i++) {
                    if (this.game.state.dealerCards[i].anim === 0) {
                        animCard(side, i, constants.CARD_STATE_FACE_DOWN, delay);
                        playDelayedSound('shuffle', delay);

                        if (this.game.state.dealerCards[i].text === 'hidden') {
                            // TODO and user ended his turn
                            // dont flip hidden card on dealer (it wont have image anyway)
                        } else {
                            animCard(side, i, constants.CARD_STATE_FACE_UP, delay + delayBeforeStateChange);
                            delay += delayInc;
                        }
                    } else if (this.game.state.dealerCards[i].anim === 1 && this.game.state.stage === 'done') {
                        animCard(side, i, constants.CARD_STATE_FACE_UP, delay);
                        delay += delayInc;
                    }
                }

                changeVisibleCardScoreWithDelay(this.game.state.dealerValue, 'dealer', delay - delayInc + delayInRevealANim);
            }

            this.game.currentDelay = delay + delayInRevealANim;

            if (callback) {
                setTimeout(callback, this.game.currentDelay);
            }
        },

        throwCardsAwayAnimation(callback) {
            // hide card values
            this.resetVisibleCardsScore();

            // proceed with card animations
            let vm = this;
            let initialDelay = 50; // give it a bit to update
            let maxDelay = 0;
            let delay = 0; // initial delay for animation (350ms) plus delay from any animations before
            let delayIncrease = 100; // convert s -> ms (for set timeout

            let prepPlayerCardLeave = (_side, _index, _delay) => {
                setTimeout(() => {
                    vm.game.animations[_side][_index] = constants.CARD_STATE_AWAY;

                    // condition fixes errors on cheats triggered at any time
                    if (vm.game.state.handInfo[_side].cards[_index] !== undefined) vm.game.state.handInfo[_side].cards[_index].anim = constants.CARD_STATE_AWAY;
                }, _delay);
            };
            let prepDealerCardLeave = (_side, _index, _delay) => {
                setTimeout(() => {
                    vm.game.animations[_side][_index] = constants.CARD_STATE_AWAY;

                    // condition fixes errors on cheats triggered at any time
                    if (vm.game.state.dealerCards[_index] !== undefined) vm.game.state.dealerCards[_index].anim = constants.CARD_STATE_AWAY;
                }, _delay);
            };

            // player cards
            for (let side in this.game.state.handInfo) {
                if (this.handHasCards(side)) {
                    let len = this.game.state.handInfo[side].cards.length - 1;
                    delay = initialDelay;
                    // SHOULD START FROM LAST CARD FIRST
                    for (let i = len; i >= 0; i--) {
                        prepPlayerCardLeave(side, i, delay);
                        delay += delayIncrease;
                    }
                    maxDelay = Math.max(maxDelay, delay);
                }
            }

            // dealer cards
            let side = 'dealer';
            let len = this.game.state.dealerCards.length - 1;
            delay = initialDelay;
            for (let i = len; i >= 0; i--) {
                prepDealerCardLeave(side, i, delay);
                delay += delayIncrease;
            }
            maxDelay = Math.max(maxDelay, delay);

            // plus transition speed of flip + move before callign final callback
            const inSeconds = constants.CARD_FLIP_ANIMATION_SPEED + constants.CARD_LEAVE_ANIMATION_SPEED;
            maxDelay += parseInt(inSeconds * 1000);

            if (callback) {
                setTimeout(() => {
                    callback();
                }, maxDelay);
            }
        },

        clearBoard(end) {
            const vm = this;

            // show end text
            setTimeout(() => {
                // set game over state
                vm.game.currentAction = end;

                // animate coins going to either dealer or back to player
                vm.triggerCoinsAnimation();
            }, 250);

            setTimeout(() => {
                if (end === constants.PLAYER_TIE) {
                    vm.$emit('sound:tie');
                } else if (end === constants.PLAYER_WIN) {
                    vm.$emit('sound:win');
                } else if (end === constants.PLAYER_LOSS) {
                    vm.$emit('sound:lose');
                }
            }, 500);

            setTimeout(() => {
                vm.game.currentAction = constants.NEED_RESTART;
                vm.game.busy = false;
            }, 2000);
        },

        triggerCoinsAnimation() {
            this.$root.$emit('coinsTotalBetVisible', false);

            let delayBetweenCoins = 140; // in ms, default 150 (which is 0.1 second)
            let vm = this;
            let delayedCoinTransitions = (_index, _delay) => {
                setTimeout(() => {
                    vm.game.betHistory[_index].show = false;
                }, _delay);
            };

            for (let i = 0; i < this.game.betHistory.length; i++) {
                if (i >= 3) break;
                delayedCoinTransitions(i, i * delayBetweenCoins);
            }
        },

        restart(skipEmit, callback) {
            if (this.game.state.stage === 'done' && this.game.clean !== true) {
                this.$root.$emit('beforeRestart');
                let vm = this;
                this.game.busy = true;
                this.throwCardsAwayAnimation(() => {
                    vm.game.busy = false;
                    vm.restart(skipEmit, callback);
                });
                this.game.clean = true;
                return;
            }

            this.$root.$emit('updatePositions');
            this.resetVisibleCardsScore();
            this.game.double = 1;
            this.game.currentAction = null;
            this.game.prepBet = 0;
            this.game.hands = 0;
            this.game.betHistory = [];
            this.game.dealerPays = [];
            this.game.animations = { left: [], right: [], dealer: [] }; // card animation states: 0 - not visible, 1 - on table, but hidden, 2 - on tablet and flipped over
            this.prepareDefaultAnimData();

            if (skipEmit === undefined) {
                this.socket.emit('restart', {
                    player: this.player,
                });
            }

            if (callback) callback();
        },

        resetVisibleCardsScore() {
            this.game.cardValues = {
                dealer: 0,
                left: 0,
                right: 0,
            };
        },

        handHasCards(side, _state) {
            if (typeof _state === 'undefined') _state = this.game.state;

            return _state.handInfo !== undefined && _state.handInfo[side] && _state.handInfo[side].cards && Object.keys(_state.handInfo[side].cards).length > 0;
        },

        highlightActiveCards(side) {
            return this.game.state.position === side && this.game.hands > 1 && this.game.state.stage !== 'ready' && this.game.state.stage !== 'done';
        },

        updateBalance(balance) {
            if (balance === undefined) return;

            this.player.softBalance = balance;
            this.player.balance = balance;
        },

        currentTotalBetAmount() {
            if (this.game.state !== undefined && this.game.state.currentBet > 0) {
                return this.game.state.currentBet;
            }
            return this.game.prepBet;
        },

        currentBetAmountPerGroupOfChips() {
            let amount = this.currentTotalBetAmount();
            if (this.game.double > 1) {
                return parseInt(amount / this.game.double);
            } else if (this.game.hands > 1) {
                return parseInt(amount / this.game.hands);
            }
            return amount;
        },

        animateBet() {
            let vm = this;
            let delay = 200;

            let animateBetWithDelay = (_index, _delay) => {
                setTimeout(function() {
                    vm.game.betHistory[_index].show = true;
                }, _delay);
            };

            for (let i = 0; i < this.game.betHistory.length; i++) {
                if (i >= 3) break; // limited visibility of coins
                animateBetWithDelay(i, delay + delay * i);
            }
        },

        setAnimationCardState(side, index, animState) {
            this.game.animations[side][index] = animState;
            if (side === 'dealer') {
                this.game.state.dealerCards[index].anim = animState;
            } else {
                this.game.state.handInfo[side].cards[index].anim = animState;
            }
        },

        gameNeedsToRestart() {
            if (this.game.currentAction === constants.NEED_RESTART) {
                return true;
            }
            return false;
        },

        toggleMute() {
            if (typeof sound === 'undefined') return;

            sound.toggleMute();
            this.muted = sound.isMuted();
        },

        playSound(key) {
            if (typeof sound === 'undefined') return;

            sound.play(key);
            return true;
        },
    },

    computed: {
        limitVisibleCoinsOnTable() {
            return this.game.betHistory.slice(0, 3);
        },

        soundsEnabled() {
            if (typeof sound === 'undefined') {
                return false;
            }

            this.muted = sound.isMuted(); // works liek init for icon
            return true;
        },
    },
    filters: {
        balanceInTrx(value, decimals) {
            return value;
            // if(decimals === undefined) decimals = 3;
            // return Number(value / 1000).toFixed(decimals);
        },
        showCardScore(score) {
            if (score <= 0) return '';
            return score;
        },
    },
};
