const Errors = {
    UNKNOWN_ACTION : 'Unknown user action',
    INSUFFICIENT_BALANCE: 'Insufficient balance',
    WRONG_BET_AMOUNT: 'Wrong bet amount supplied. Should be a numeric value.',
    MINIMUM_BET: 'Minimum bet rule not satisfied',
    MAXIMUM_BET: 'Current bet is over the maximum allowed',
    GAME_NOT_ENDED: 'Game not ended yet!',
    CANT_DO_ACTION: 'Player not allowed to perform this action',
    CANT_BET: 'Player not allowed to bet right now',
    FAKE_BET_INCREASE: 'Cheating attempt. Player not allowed to increase bet more than initial bet',
}

module.exports = Errors;