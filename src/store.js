import Vue from 'vue';
import Vuex from 'vuex';
import { i18n } from './i18n';
import { getMyBets, getAllBets } from './api/dice';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        // 钱包
        wallet: { address: undefined, installed: false, mainnet: true, balance: undefined }, // { address: undefined,mainnet:true,},
        modals: {
            loadingText: false,
            betErrorModal: false,
            notEnoughBalanceModal: false,
            bjTipsModal: false,
            bjRechargeModal:false,
            notMainNetModal: false,
            referralModal: false,
            dividendsModal: false,
            freezeModal: false,
            unfreezeModal: false,
            comingModal: false,
            loginModal: false,
        },
        dice: {
            mybets: undefined,
            allbets: undefined,
            lottery: undefined, // { lotterynum: 78, state: 10, betamountInTrx: '20,000.0000', winamountInTrx: '20,000.0000' }
            lotteryNumMarksIntrupted: false,
        },
    },
    getters: {
        lottery(state) {
            return state.dice && state.dice.lottery;
        },
        lotteryNumMarksIntrupted(state) {
            return state.dice && state.dice.lotteryNumMarksIntrupted;
        },
        loged(state) {
            return state.wallet && state.wallet.address;
        },
        address(state) {
            return state.wallet && state.wallet.address;
        },
        balance(state) {
            return state.wallet && state.wallet.balance;
        },
        mainnet(state) {
            return state.wallet && state.wallet.mainnet;
        },
        betErrorModal(state) {
            return state.modals.betErrorModal;
        },
        notEnoughBalanceModal(state) {
            return state.modals.notEnoughBalanceModal;
        },
        bjTipsModal(state) {
            return state.modals.bjTipsModal;
        },
        bjRechargeModal(state) {
            return state.modals.bjRechargeModal;
        },
        notMainNetModal(state) {
            return state.modals.notMainNetModal;
        },
        referralModal(state) {
            return state.modals.referralModal;
        },
        dividendsModal(state) {
            return state.modals.dividendsModal;
        },
        freezeModal(state) {
            return state.modals.freezeModal;
        },
        unfreezeModal(state) {
            return state.modals.unfreezeModal;
        },
        loadingText(state) {
            return state.modals.loadingText;
        },
        comingModal(state) {
            return state.modals.comingModal;
        },
        loginModal(state) {
            return state.modals.loginModal;
        },
        mybets(state) {
            return state.dice.mybets;
        },
        allbets(state) {
            return state.dice.allbets;
        },
    },
    mutations: {
        locale(state, locale) {
            i18n.locale = locale;
            window.localStorage.setItem('_i_locale', locale);
        },
        walletInstalled(state, installed) {
            Vue.set(state.wallet, 'installed', installed);
        },
        walletAddress(state, address) {
            Vue.set(state.wallet, 'address', address);
        },
        mainnet(state, mainnet) {
            Vue.set(state.wallet, 'mainnet', mainnet);
        },
        balance(state, balance) {
            Vue.set(state.wallet, 'balance', balance);
        },
        modal(state, { modal, showable }) {
            ['bjRechargeModal','notEnoughBalanceModal', 'notMainNetModal', 'referralModal', 'dividendsModal', 'freezeModal', 'loginModal'].forEach(modalname => {
                Vue.set(state.modals, modalname, false);
            });
            Vue.set(state.modals, modal, showable);
        },
        betErrorModal(state, betErrTips) {
            Vue.set(state.modals, 'betErrorModal', betErrTips);
        },
        bjTipsModal(state, bjTips) {
            Vue.set(state.modals, 'bjTipsModal', bjTips);
        },
        loadingText(state, loadingText) {
            Vue.set(state.modals, 'loadingText', loadingText);
        },
        mybets(state, data) {
            Vue.set(state.dice, 'mybets', data);
        },
        allbets(state, data) {
            Vue.set(state.dice, 'allbets', data);
        },
        lottery(state, lottery) {
            Vue.set(state.dice, 'lottery', lottery);
        },
        lotteryNumMarksIntrupted(state, lotteryNumMarksIntrupted) {
            Vue.set(state.dice, 'lotteryNumMarksIntrupted', lotteryNumMarksIntrupted);
        },
    },
    actions: {
        async setLocale({ commit }, locale) {
            try {
                if (locale in i18n.messages) {
                    commit('locale', locale);
                    return;
                }
                const resp = await import(`./locale/${locale}.json`);
                i18n.setLocaleMessage(locale, resp.default);
                commit('locale', locale);
            } catch (err) {
                console.error(err);
            }
        },
        setLottery({ commit }, lottery) {
            commit('lottery', lottery);
        },
        setLotteryNumMarksIntrupted({ commit }, lotteryNumMarksIntrupted) {
            commit('lotteryNumMarksIntrupted', lotteryNumMarksIntrupted);
        },
        async getMyBets({ commit, state }) {
            if (!state.wallet || !state.wallet.address) {
                return commit('mybets', null);
            }
            const r = await getMyBets(window.tronWeb.address.toHex(state.wallet.address));
            commit('mybets', r);
        },
        async getAllBets({ commit }) {
            const r = await getAllBets();
            commit('allbets', r);
        },
        updateWalletInstalled({ commit }, installed = false) {
            commit('walletInstalled', installed);
            if (installed === false) {
                commit('walletAddress', undefined);
                commit('mainnet', false);
                commit('balance', undefined);
            }
        },
        updateAddress({ commit }, address) {
            commit('walletAddress', address);
        },
        updateMainnet({ commit }, mainnet) {
            commit('mainnet', mainnet);
        },
        updateBalance({ commit }, balance) {
            commit('balance', balance);
        },
        showModal({ commit }, modal) {
            commit('modal', { modal, showable: true });
            return () => {
                commit('modal', { modal, showable: false });
            };
        },
        showBetErrorModal({ commit }, betErrTips) {
            commit('betErrorModal', betErrTips);
        },
        closeBetErrorModal({ commit }) {
            commit('betErrorModal', false);
        },
        showBjTipsModal({ commit }, bjTips) {
            commit('bjTipsModal', bjTips);
        },
        closeBjTipsModal({ commit }) {
            commit('bjTipsModal', false);
        },
        showBjRechargeModal({commit}) {
            commit('modal',{modal: 'bjRechargeModal',showable: true});
        },
        closeBjRechargeModal({commit}){
            commit('modal',{modal: 'bjRechargeModal',showable: false});
        },
        showNotEnoughBalanceModal({ commit }) {
            commit('modal', { modal: 'notEnoughBalanceModal', showable: true });
        },
        closeNotEnoughBalanceModal({ commit }) {
            commit('modal', { modal: 'notEnoughBalanceModal', showable: false });
        },
        showNotMainNetModal({ commit }) {
            commit('modal', { modal: 'notMainNetModal', showable: true });
        },
        closeNotMainNetModal({ commit }) {
            commit('modal', { modal: 'notMainNetModal', showable: false });
        },
        showReferralModal({ commit }) {
            commit('modal', { modal: 'referralModal', showable: true });
        },
        closeReferralModal({ commit }) {
            commit('modal', { modal: 'referralModal', showable: false });
        },
        showDividendsModal({ commit }) {
            commit('modal', { modal: 'dividendsModal', showable: true });
        },
        closeDividendsModal({ commit }) {
            commit('modal', { modal: 'dividendsModal', showable: false });
        },
        showFreezeModal({ commit }) {
            commit('modal', { modal: 'freezeModal', showable: true });
        },
        closeFreezeModal({ commit }) {
            commit('modal', { modal: 'freezeModal', showable: false });
        },
        showUnfreezeModal({ commit }) {
            commit('modal', { modal: 'unfreezeModal', showable: true });
        },
        closeUnfreezeModal({ commit }) {
            commit('modal', { modal: 'unfreezeModal', showable: false });
        },
        showComingModal({ commit }) {
            commit('modal', { modal: 'comingModal', showable: true });
        },
        closeComingModal({ commit }) {
            commit('modal', { modal: 'comingModal', showable: false });
        },
        showLoginModal({ commit }) {
            commit('modal', { modal: 'loginModal', showable: true });
        },
        closeLoginModal({ commit }) {
            commit('modal', { modal: 'loginModal', showable: false });
        },
        showLoading({ commit }, text) {
            commit('loadingText', text);
        },
        closeLoading({ commit }) {
            commit('loadingText', false);
        },
    },
});
