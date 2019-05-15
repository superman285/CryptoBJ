export default {
    name: 'Modal',
    props: {
        width: {
            type: String,
            required: true,
        },
        closable: {
            type: Boolean,
            required: false,
            default: true,
        },
    },
};
