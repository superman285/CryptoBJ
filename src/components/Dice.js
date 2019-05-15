import vueSlider from 'vue-slider-component';
import Utils from '../utils';

//import TronWeb from 'tronweb';
//const FOUNDATION_ADDRESS = 'TSHVF4ZN5QgdYvupSQQRNwxxYtunb5ZzPW';

import { getBet, postBet } from '@/api/dice';

export default {
    name: 'Dice',
    components: {
        vueSlider,
    },
    props: {
        msg: String,
    },
    computed: {
        state() {
            return this.bet_amount >= 0.01 ? true : false;
        },
        invalidFeedback() {
            if (this.bet_amount >= 0.01) {
                return '';
            } else if (this.bet_amount < 0.01) {
                return 'Bet Amount Should Be More Than 0.01';
            } else {
                return 'Please Enter Bet Amount';
            }
        },
        validFeedback() {
            return this.state === true ? 'Thank You' : '';
        },
        payout_on_win: function() {
            return this.bet_amount * this.payout;
        },
        payout: function() {
            return 100.0 / this.win_chance;
        },
        roll_to_win: function() {
            return this.vue_slider.value;
        },
    },
    methods: {
        async getAccount() {
            this.tron_address = window.tronWeb.defaultAddress.base58;
            this.tron_balance = (await window.tronWeb.trx.getBalance()) / 1000000;
        },
        doubleBet() {
            this.bet_amount = this.bet_amount * 2;
        },
        halfBet() {
            this.bet_amount = this.bet_amount / 2;
        },
        minBet() {
            this.bet_amount = 0.01;
        },
        maxBet() {
            this.bet_amount = this.tron_balance;
        },
        sliderChange() {
            if (!this.roll_type) {
                this.win_chance = this.vue_slider.value;
            } else {
                this.win_chance = 100 - this.vue_slider.value;
            }
        },
        rollunder() {
            this.roll_to_win_label = 'ROLL UNDER TO WIN';
            this.roll_type = 0;
            this.win_chance = this.vue_slider.value;
        },
        rollover() {
            this.roll_to_win_label = 'ROLL OVER TO WIN';
            this.roll_type = 1;
            this.win_chance = 100 - this.vue_slider.value;
        },
        async bet() {
            debugger;
            var betMask;
            var modulo = 100;
            if (!this.roll_type) betMask = this.roll_to_win;
            else betMask = 100 - this.roll_to_win;
            Utils.placeBet(betMask, 100, this.commitLastBlock, commit, this.sig, r, s).then(() => {
                postBet(betMask, 100, this.commitLastBlock, commit, r, s).then(res => {
                    console.log(res);
                });
            });
        },
    },
    data() {
        return {
            bet_amount: 100,
            roll_to_win_label: 'ROLL UNDER TO WIN',
            win_chance: 50,
            vue_slider: {
                value: 50, // 值
                width: '100%', // 组件宽度
                height: 6, // 组件高度
                direction: 'horizontal', // 组件方向
                dotSize: 16, // 滑块大小
                eventType: 'auto', // 事件类型
                min: 0, // 最小值
                max: 100, // 最大值
                interval: 1, // 分段间隔
            },
            roll_type: 0,
            tron_balance: '',
            tron_address: '',

            commit: '',
            commitLastBlock: '',
            sig: '',
        };
    },
    updated: function() {
        this.getAccount();
    },

    mounted: function() {
        getBet().then(res => {
            this.commit = res.commit;
            this.commitLastBlock = res.commitLastBlock;
            this.sig = res.sig;
        });
    },
};

window.onload = function() {
    if (window.tronWeb) {
        Utils.setTronWeb(window.tronWeb);
        setTimeout(function() {
            window.tronWeb.trx.getBalance().then(balance => {
                document.getElementById('tronBalance').innerText = balance / 1000000;
            });
            document.getElementById('tronAddress').innerText = window.tronWeb.defaultAddress.base58;
        }, 500);
    } else alert('You need install TronLink first.');
};
