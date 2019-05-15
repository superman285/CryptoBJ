const {getRules, getFrontRules} = require('./engine/rules');

// you can change default rules here, simply by uncommenting and entering new value
const CUSTOMIZED_RULES = {
    // minimumBet: 10, // default: 10
    // maximumBet: 10000, // default: 10000
    // split : true, // default: true
    // standOnSoft17: false, // default: false
}

module.exports = {
    frontRules: getFrontRules(CUSTOMIZED_RULES),
    backendRules: ()=>{
        return getRules(CUSTOMIZED_RULES);
    },
}