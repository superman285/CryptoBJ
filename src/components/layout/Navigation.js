import { mapActions } from 'vuex';
import Modal from '../common/Modal';
import Button from '../common/Button';

export default {
    name: 'Navigation',
    data() {
        return {
            // referralLink: "www.cryptofate.com/Ref812712"
        };
    },
    components: {
        Modal,
        Button,
    },
    methods: {
        ...mapActions(['showDividendsModal', 'showReferralModal', 'showComingModal']),
        isActiveClass(path) {
            // Logic for check current route
            if (path === this.$route.path) return true;
            return false;
        },
    },
};
