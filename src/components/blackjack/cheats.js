var cheatsParams = {
    enabled: true,
    visible: false,
    selected: 0,
    options: [
        { text: 'Player 21', cheatCode: 'player_21', restart: true },
        { text: 'Player Blackjack', cheatCode: 'player_blackjack', restart: true },
        { text: 'Dealer 21 [10s first]', cheatCode: 'dealer_blackjack', restart: true },
        { text: 'Dealer 21 [ace first]', cheatCode: 'dealer_blackjack_2', restart: true },
        { text: 'Dealer win', cheatCode: 'dealer_win', restart: true },
        { text: 'Player split', cheatCode: 'split', restart: true },
        { text: 'Player 2x Ace', cheatCode: 'double_ace', restart: true },
        { text: 'Balance to 50k', cheatCode: 'balance_50', restart: false },
        { text: 'Balance to 1k', cheatCode: 'balance_1', restart: false },
        { text: 'Check server state', cheatCode: 'debug_state', restart: false },
    ],
}

export var cheats = cheatsParams;
export { cheats as default };