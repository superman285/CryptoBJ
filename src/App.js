import { mapActions, mapGetters } from 'vuex';
import Modal from './components/common/Modal';
import Button from './components/common/Button';
import TopHeader from './components/layout/TopHeader.vue';
import MidHeader from './components/layout/MidHeader.vue';
import Navigation from './components/layout/Navigation.vue';
import Footer from './components/layout/Footer.vue';
import { generate } from 'shortid';
const tempRefCode = generate();

let mainnet = true;
export default {
    components: {
        TopHeader,
        MidHeader,
        Navigation,
        Footer,
        Modal,
        Button,
    },
    data() {
        return {
            isMainNet: true,
            tempRefCode,
            balance: undefined,
            tempReferralLink: 'www.cryptofate.com/Ref' + tempRefCode,
        };
    },
    watch: {
        address() {
            this.updateBalance(null);
        },
    },
    computed: {
        ...mapGetters([
            'betErrorModal',
            'notEnoughBalanceModal',
            'bjTipsModal',
            'mainnet',
            'address',
            'notMainNetModal',
            'referralModal',
            'dividendsModal',
            'freezeModal',
            'unfreezeModal',
            'loadingText',
            'comingModal',
            'loginModal',
            'lottery',
            'lotteryNumMarksIntrupted',
        ]),
        betResultClasses() {
            return this.lottery && !this.lotteryNumMarksIntrupted
                ? this.lottery.state > 0
                    ? 'betResultMask win show'
                    : 'betResultMask show'
                : 'betResultMask';
        },
    },
    methods: {
        ...mapActions([
            'updateWalletInstalled',
            'updateAddress',
            'updateMainnet',
            'updateBalance',
            'closeBetErrorModal',
            'closeNotEnoughBalanceModal',
            'closeBjTipsModal',
            'closeReferralModal',
            'closeDividendsModal',
            'showFreezeModal',
            'closeFreezeModal',
            'showUnfreezeModal',
            'closeUnfreezeModal',
            'showLoginModal',
            'closeLoginModal',
            'showLoading',
            'closeLoading',
            'closeComingModal',
        ]),
        copyToClipBoard() {
            // Logic for copy link
            this.$refs.copyLink.select();
            document.execCommand('copy');
        },
        async check() {
            // 1. check variable, 检查tronweb是否已经加载
            if (window.tronWeb) {
                this.updateWalletInstalled(true);
                let tronWeb = window.tronWeb;
                let _mainnet = tronWeb.fullNode.host.indexOf('api.shasta') === -1;
                if (mainnet !== _mainnet) {
                    mainnet = _mainnet;
                    this.updateMainnet(mainnet);
                }
                // 2. check node connection，检查所需要的API是否都可以连通
                // const nodes = await tronWeb.isConnected();
                // const connected = !Object.entries(nodes)
                //     .map(([name, connected]) => {
                //         if (!connected) {
                //             console.error(`Error: ${name} is not connected`);
                //         }
                //         return connected;
                //     })
                //     .includes(false);
                this.updateAddress(tronWeb.defaultAddress && tronWeb.defaultAddress.base58);
                this.__check_timer = setTimeout(this.check.bind(this), 100);
            } else {
                // 如果检测到没有注入tronWeb对象，则等待100ms后重新检测
                this.updateWalletInstalled(false);
                this.__check_timer = setTimeout(this.check.bind(this), 100);
            }
        },

        checkBalance() {
            const tronWeb = window.tronWeb;
            if (!tronWeb) {
                this.__check_balance_timer = setTimeout(this.checkBalance.bind(this), 3000);
                return;
            }

            if (!tronWeb.defaultAddress && !tronWeb.defaultAddress.hex) {
                this.updateBalance();
                this.__check_balance_timer = setTimeout(this.checkBalance.bind(this), 3000);
                return;
            }

            tronWeb.trx
                .getBalance(tronWeb.defaultAddress.hex)
                .then(balance => {
                    this.updateBalance(balance);
                })
                .catch(console.warn)
                .finally(() => {
                    this.__check_balance_timer = setTimeout(this.checkBalance.bind(this), 3000);
                });
        },
    },
    created() {
        // hub.$on('not-enough-balance', this.onNotEnoughBalance.bind(this));
    },
    mounted() {
        this.check();
        this.checkBalance();
        // window.setTimeout(this.closeLoading.bind(this), 5000);
        /*
        const str = (navigator.language || navigator.browserLanguage).toLowerCase();
        let lang = 'en';
        if (str.indexOf('zh') === 0) {
            lang = 'zh';
        } else if (str.indexOf('ko') === 0) {
            lang = 'ko';
        }
        this.updateLanguage(lang); */
    },
    beforeDestroy() {
        this.__check_timer && (clearTimeout(this.__check_timer), delete this.__check_timer);
        this.__check_balance_timer && (clearTimeout(this.__check_balance_timer), delete this.__check_balance_timer);
    },
};
