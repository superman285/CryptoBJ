import { mapActions, mapState, mapGetters } from 'vuex';
import { i18n } from '../../i18n';
import Button from '../common/Button';

export default {
    name: 'MidHeader',
    components: {
        Button,
    },
    data() {
        return {
            locales: {
                en: 'English',
                zh: '简体中文',
                ko: '한국어',
            },
        };
    },
    methods: {
        ...mapActions(['updateLanguage', 'showLoginModal', 'setLocale']),
    },
    computed: {
        ...mapGetters(['loged', 'address']),
        localeLabel() {
            return this.locales[i18n.locale];
        },
        shortAddress() {
            if (!this.loged) {
                return;
            }
            return this.loged.substring(0, 4) + '...' + this.loged.substring(this.loged.length - 4);
        },
    },
};
