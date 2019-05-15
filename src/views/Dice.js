import { mapActions, mapGetters, mapState } from 'vuex';
import Button from '../components/common/Button';
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/antd.css';

import { getLotteryResult, getDiceAddress } from '../api/dice.js';

export default {
    name: 'dice',
    data() {
        return {
            isrolling: false,
            rollingNum: undefined,
            trxInputValue: 100,
            minTrxInputValue: 10,
            maxTrxInputValue: 20000,
            rollType: 'roll-under',
            rollText: 'roll under to win',
            rangeValue: 50,
            soundOn: true,
            betType: 'my-bet',
            autobet: false,
            singleBetErrTip: 'Bet failed, your tokens are still in your wallet. Please try again :)',
            autoBetErrTip: 'Bet failed, your tokens are still in your wallet. Autobetting again :)',
            timeoutTip: 'Bet submitted, you could continue the game and check payouts later in My Bets.',
            // option for range roll under
            rollUnderRange: {
                min: 2,
                max: 96,
                dotSize: 30,
                height: 14,
                tooltip: 'always',
                tooltipStyle: { width: '30px', backgroundColor: '#fff', color: '#000' },
                dotStyle: { backgroundColor: '#157103', border: '5px solid #ebebeb' },
                railStyle: { backgroundColor: '#e63550' },
                processStyle: { backgroundColor: '#6eeea1' },
            },
            // option 2 for range roll over
            rollOverRange: {
                min: 4,
                max: 98,
                dotSize: 30,
                height: 14,
                tooltip: 'always',
                tooltipStyle: { width: '30px', backgroundColor: '#fff', color: '#000' },
                dotStyle: { backgroundColor: '#157103', border: '5px solid #ebebeb' },
                railStyle: { backgroundColor: '#6eeea1' },
                processStyle: { backgroundColor: '#e63550' },
            },
        };
    },
    components: {
        Button,
        VueSlider,
    },
    watch: {
        rangeValue() {
            this.setLotteryNumMarksIntrupted(true);
        },
        address(address) {
            this._trigger_next && this._trigger_next();
        },
        autobet(autobet) {
            if (autobet === true) {
                this.startAutoBet();
            } else {
                this.stopAutoBet();
            }
        },
    },
    methods: {
        ...mapActions([
            'updateBalance',
            'showModal',
            'showBetErrorModal',
            'closeBetErrorModal',
            'showNotEnoughBalanceModal',
            'closeNotEnoughBalanceModal',
            'showLoginModal',
            'closeLoginModal',
            'showLoading',
            'closeLoading',
            'getMyBets',
            'getAllBets',
            'setLottery',
            'setLotteryNumMarksIntrupted',
        ]),
        getLotteryResult(id) {
            return new Promise(async (resolve, reject) => {
                const stopRolling = this.rolling();
                let count = 0;

                const get_lottery_result = (id, idx) => {
                    if (idx >= 8) {
                        stopRolling();
                        this.showBetErrorModal(this.timeoutTip);
                        setTimeout(()=>{
                            this.closeBetErrorModal();
                        },2500);
                        return reject(new Error('retry count exceeded'));
                    }

                    getLotteryResult(id)
                        .then(r => {
                            if (r) {
                                stopRolling();
                                this.setLotteryNumMarksIntrupted(false);
                                this.setLottery(r);
                                resolve();
                            } else {
                                setTimeout(get_lottery_result.bind(undefined, id, idx + 1), 1000);
                            }
                        })
                        .catch(err => {
                            console.warn(err);
                            setTimeout(get_lottery_result.bind(undefined, id, idx + 1), 1000);
                        });
                };

                get_lottery_result(id, 0);
            });
        },
        handleLoginClick() {
            this.showLoginModal();
        },
        startAutoBet() {
            const _do_next_bet = () => {
                if (!this.autobet) {
                    this._next_bet_timer && (clearTimeout(this._next_bet_timer), delete this._next_bet_timer, delete this._timer_start_time);
                    return;
                }
                if (this.isrolling) {
                    this._next_bet_timer = setTimeout(_do_next_bet, 3000);
                    return;
                }
                this._timer_start_time = Date.now();
                this.bet((err, id) => {
                    if (err) {
                        console.error(err);
                        this.showBetErrorModal(this.autoBetErrTip);
                        setTimeout(()=>{
                            this.closeBetErrorModal();
                        },2000);
                        // this.autobet = false;
                        this._trigger_next();
                        this._next_bet_timer = setTimeout(_do_next_bet, 3000);
                        return;
                    }
                    this.getLotteryResult(id)
                        .catch(console.warn)
                        .finally(() => {
                            this._trigger_next();
                            this._next_bet_timer = setTimeout(_do_next_bet, 3000);
                        });
                });
            };
            _do_next_bet();
        },
        stopAutoBet() {
            this._next_bet_timer && (clearTimeout(this._next_bet_timer), delete this._next_bet_timer, delete this._timer_start_time);
        },
        handleBetClick() {
            return this.bet((err, id) => {
                if (err) {
                    console.error(err);
                    this.showBetErrorModal(this.singleBetErrTip);
                    setTimeout(()=>{
                        this.closeBetErrorModal();
                    },2000);
                    return;
                }
                this.getLotteryResult(id)
                    .catch(console.error)
                    .finally(this._trigger_next.bind(this));
            });
        },
        rolling() {
            this.isrolling = true;
            const stop = () => {
                this.isrolling = false;
                this._rolling_timer && (clearInterval(this._rolling_timer), delete this._rolling_timer);
                this.rollingNum = undefined;
            };
            stop.rolling = () => {
                this.rollingNum = 1;
                this._rolling_timer = setInterval(() => {
                    this.rollingNum += 1;
                }, 10);
            };
            return stop;
        },
        async bet(callback) {
            this.setLotteryNumMarksIntrupted(true);
            const stopRolling = this.rolling();
            try {
                // this.showLoading('Betting...');
                const tronWeb = window.tronWeb;
                const callValue = tronWeb.BigNumber(tronWeb.toSun(this.trxInputValue));
                const balance = tronWeb.BigNumber(await tronWeb.trx.getBalance(tronWeb.defaultAddress.base58));
                if (!balance.isGreaterThanOrEqualTo(callValue)) {
                    this.showNotEnoughBalanceModal();
                    setTimeout(()=>{
                        this.closeNotEnoughBalanceModal();
                    },2000);
                    stopRolling();
                    callback && callback(new Error('balance not enough'));
                    return;
                }

                const address = await getDiceAddress();
                console.log('contract address : ', address);
                const contract = await tronWeb.contract().at(address);

                const randomNumber = Math.floor(Math.random() * 1000) % 255;
                const rollType = { 'roll-under': 2, 'roll-over': 1 }[this.rollType];

                //tx: split to 3step: build sign broadcast
                let tx = await tronWeb.transactionBuilder.triggerSmartContract(address, 'placeBet(uint8,uint8,uint8)', 1000000000, callValue.toString(), [
                    { type: 'uint8', value: rollType },
                    { type: 'uint8', value: parseInt(this.rangeValue) },
                    { type: 'uint8', value: randomNumber },
                ]);
                let signedTx = await tronWeb.trx.signMessage(tx.transaction);
                stopRolling.rolling();
                let txreceipt = await tronWeb.trx.sendRawTransaction(signedTx);
                console.log('txID', txreceipt.transaction.txID);
                callback && callback(undefined, txreceipt.transaction.txID);
            } catch (err) {
                console.error(err);
                stopRolling();
                callback && callback(err);
            }
        },
        handleRollOver() {
            if (this.rangeValue === 2) {
                this.rangeValue = 4;
            }
            this.rollType = 'roll-over';
            this.rollText = 'roll over to win';
        },
        handleRollUnder() {
            if (this.rangeValue === 98) {
                this.rangeValue = 96;
            }
            this.rollType = 'roll-under';
            this.rollText = 'roll under to win';
        },
        handleMyBetClick() {
            this.betType = 'my-bet';
            this._trigger_next && this._trigger_next();
        },
        handleAllBetClick() {
            this.betType = 'all-bet';
            this._trigger_next && this._trigger_next();
        },
        soundHandler() {
            this.soundOn = !this.soundOn;
        },
        getSoundImg() {
            return this.soundOn ? require('../assets/speaker.png') : require('../assets/mute.png');
        },
        onHalfBtnClick() {
            this.trxInputValue = this.trxInputValue / 2;
            if (this.trxInputValue < this.minTrxInputValue) {
                this.trxInputValue = this.minTrxInputValue;
            }
        },
        onTwoXBtnClick() {
            this.trxInputValue = this.trxInputValue * 2;
            if (this.trxInputValue > this.maxTrxInputValue) {
                this.trxInputValue = this.maxTrxInputValue;
            }
        },
        onMinBtnClick() {
            this.trxInputValue = this.minTrxInputValue;
        },
        onMaxBtnClick() {
            this.trxInputValue = this.maxTrxInputValue;
        },
    },
    computed: {
        ...mapGetters(['loged', 'address', 'balance', 'mybets', 'allbets', 'lottery', 'lotteryNumMarksIntrupted']),
        bets() {
            let bets = this.betType === 'my-bet' ? this.mybets : this.allbets;
            bets = bets ? bets.datas || [] : [];
            return bets;
        },
        formatedBalance() {
            const tronWeb = window.tronWeb;
            if (typeof this.balance === 'undefined' || this.balance === null) {
                return '-';
            }
            return tronWeb.BigNumber(tronWeb.fromSun(this.balance || 0)).toFormat(4);
        },
        betButtonLabel() {
            if (this.isrolling === true && typeof this.rollingNum === 'undefined') {
                return 'rolling ...';
            } else if (this.isrolling === true && typeof this.rollingNum !== 'undefined') {
                const n = this.rollingNum % 100;
                return n < 10 ? '0' : '' + n;
            }
            if (this.rollType === 'roll-under') {
                return 'UNDER ' + this.rangeValue;
            } else {
                return 'OVER ' + this.rangeValue;
            }
        },
        payoutMulti: function() {
            const num = 98.5 / this.winChances;
            const formatedNum = Math.floor(num * 10000) / 10000;
            return formatedNum;
        },
        payoutOnWin: function() {
            return this.trxInputValue * this.payoutMulti;
        },
        currentArrow: function() {
            if (this.rollType === 'roll-under') {
                return {
                    transition: '0.4s',
                    transform: 'rotate(0deg)',
                };
            }
            return {
                transition: '0.4s',
                transform: 'rotate(180deg)',
            };
        },
        getRollOverBtnType: function() {
            if (this.rollType === 'roll-over') return 'button big rectangle';
            return 'button big rectangle white-outline';
        },
        getRollUnderBtnType: function() {
            if (this.rollType === 'roll-over') return 'button big rectangle white-outline';
            return 'button big rectangle';
        },
        getMyBetBtnType: function() {
            if (this.betType === 'my-bet') return 'button huge clickable';
            return 'button huge clickable red-outline';
        },
        getAllBetBtnType: function() {
            if (this.betType === 'my-bet') return 'button huge clickable  red-outline';
            return 'button huge clickable';
        },
        winChances() {
            if (this.rollType === 'roll-under') {
                return (this._winChances = this.rangeValue - 1);
            }
            if (this.rollType === 'roll-over') {
                return (this._winChances = 99 - this.rangeValue);
            }
            return (this._winChances = this.rangeValue);
        },
        lotteryNumMarks() {
            if (!this.lottery || this.lotteryNumMarksIntrupted) {
                return {};
            }
            const n = this.lottery.lotterynum;
            if (typeof n === 'undefined' || n === null) {
                return {};
            }
            const state = this.lottery.state;
            const color = state > 0 ? '#009900' : '#d80927';
            return {
                [n]: {
                    label: String(n),
                    style: {
                        display: 'block',
                        position: 'relative',
                        top: '15px',
                        'margin-left': '-2px',
                        background: 'transparent',
                        'box-shadow': 'none',
                        'border-left': '10px solid transparent',
                        'border-right': '10px solid transparent',
                        width: '0',
                        height: '0',
                        border: '10px solid transparent',
                        'border-bottom': '10px solid ' + color,
                        'border-radius': '0px',
                    },
                    labelStyle: {
                        'font-size': '14px',
                        background: color,
                        padding: '6px',
                        'border-radius': '6px',
                        width: '36px',
                        'text-align': 'center',
                        position: 'relative',
                        top: '0px',
                    },
                },
            };
        },
    },
    mounted() {
        window.scrollTo(0, 0);
        const triggerNext = (this._trigger_next = () => {
            this._timer && (clearTimeout(this._timer), delete this._timer);
            switch (this.betType) {
                case 'my-bet': {
                    this.getMyBets()
                        .catch(console.error)
                        .finally(() => {
                            this._timer = setTimeout(triggerNext, 10000);
                        });
                    break;
                }
                default: {
                    this.getAllBets()
                        .catch(console.error)
                        .finally(() => {
                            this._timer = setTimeout(triggerNext, 10000);
                        });
                    break;
                }
            }
        });
        triggerNext();
    },
    beforeDestroy() {
        this._timer && (clearTimeout(this._timer), delete this._timer);
        this._rolling_timer && (clearInterval(this._rolling_timer), delete this._rolling_timer);
    },
};
