module.exports = {
    tron: {
        fullNode: process.env.CRYPTOFATE_TRON_FULL_NODE || 'https://api.shasta.trongrid.io',
        solidityNode: process.env.CRYPTOFATE_TRON_SOLIDITY_NODE || 'https://api.shasta.trongrid.io',
        eventServer: process.env.CRYPTOFATE_TRON_EVENT_SERVER || 'https://api.shasta.trongrid.io',
        privateKey: process.env.CRYPTOFATE_TRON_PRIVATE_KEY || '1c6bd46a7809f1a95d2232514e40b6d09c7dd8b2a19e40547f7cf231c75d2ac8',
        consume_user_resource_percent: process.env.CRYPTOFATE_TRON_CONSUME_USER_RESOURCE_PERCENT || 30,
        fee_limit: process.env.CRYPTOFATE_TRON_FEE_LIMIT || 100000000,
        network_id: process.env.CRYPTOFATE_TRON_NETWORK_ID || '*',
    },
};
