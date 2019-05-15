const ERROR = require('./../errors.js')
const __ = require('./../constants.js')
const singleplayer = require('./singleplayer');
const rules = require('./blackjackRules');
const cheats = require('./cheats.js');


let BlackjackSingleplayer = ( ()=>{

    let state = {};
    let gameRules = rules.backendRules(true);

    class Blackjack{

        constructor(_state, player){
            this.currentBet = 0;
            this.position = __.GAME_POSITION_RIGHT; // active hand
            this.lastAction = null;
            state = _state !== undefined ? _state : {}; // TODO
            this.player = player;
            this.startFreshGame();
        }

        startFreshGame(){

            this.currentBet = 0;
            this.lastAction = null;
            this.game = new singleplayer.Game(null, gameRules);
            state = this.restore(); // prep stuff

            return this.getState();
        }

        getState(){
            return this.allowOnlyPublicData(state);
        }

        getRawState(){
            return state;
        }

        cheese(key, callback){ // cheats :)

            if(cheats.hasOwnProperty(key)){

                this.currentBet = 0;
                this.game = new singleplayer.Game(null, gameRules);
                state = this.restore(); // prep stuff

                // cheats - on
                state.deck = [].concat(cheats[key]).reverse();
                this.game = new singleplayer.Game(state, gameRules);
                this.bet(10);
                this.handle({action: 'deal'}, callback);
                // cheats - off
            }else{
                // normal restart
                state = this.startFreshGame();
                if(callback) callback();
            }
        }

        handle(params, onSuccess, onFailure){

            let err = undefined;
            let ret;

            this.lastAction = params.action;

            if(params.action === 'split' || params.action === 'double'){
                this.bet(state.initialBet); // double bet on either splitting cards or doubling
            }

            // first round
            if(params.action === 'deal' && params.bet === undefined && this.currentBet > 0){
                params.bet = this.currentBet; // send bet to singleplayer
            }else{

                // all other rounds after will have a position
                if(params.position === undefined){
                    params.position = this.position;
                }
                if(params.position !== this.position && params.position !== undefined){
                    this.position = params.position;
                }

            }

            params.balance = this.player.balance.get(); // checks if player has enough balance for split/double moves


            switch(params.action){
                case 'restore': ret = this.restore();
                    break;
                case 'deal': ret = this.deal(params); // req: bet, sideBets{}
                    break;

                case 'hit':
                case 'hitR':
                case 'hitL':
                    ret = this.hit(params); // optional: position
                    break;

                case 'stand':
                case 'standR':
                case 'standL':
                    ret = this.stand(params); // optional: position
                    break;

                case 'double':

                    ret = this.double(params); // optional: position
                    break;

                case 'split':

                    ret = this.split();
                    break;

                case 'dealer': ret = this.dealer();
                    break;

                default:    err = ERROR.UNKNOWN_ACTION+': '+params.action;
                    break;
            }

            if(err !== undefined){
                return onFailure(err);
            }

            return this.gameProgress(onSuccess);

        }

        gameProgress(onSuccess){

            let gameStatus = this.checkGameStatus();
            let gameOver = false;
            let wonAmount = state.wonOnRight + state.wonOnLeft;

            if(gameStatus.tie){

                // return half of the bet
                this.player.balance.add( wonAmount ); // engine handles ties already, dont need to /2 here
                gameOver = true;

            }else if(gameStatus.win){

                this.player.balance.add( wonAmount );
                gameOver = true;

            }else if(gameStatus.loss){

                gameOver = true;

            }

            state = this.game.getState();

            if(state.stage === 'player-turn-left'){
                this.position = 'left';
            }else{
                this.position = 'right';
            }

            return onSuccess( {
                state: this.allowOnlyPublicData( state, gameStatus ),
                balance: this.player.balance.get(),
            } );
        }

        isOver(){
           return state.stage === 'done';
        }

        checkGameStatus(){

            let isOver = this.isOver();
            let playerHasBlackjack = this.playerHasBlackjack();
            let playerHasBusted = this.playerHasBusted();
            let dealerScore = this.getHigherValidValue(state.dealerValue)
            let playerScore = Math.max(this.getHigherValidValue(state.handInfo.right.playerValue), this.getHigherValidValue(state.handInfo.left.playerValue));

            return {
                over: isOver,
                tie: isOver && ((playerHasBlackjack && state.dealerHasBlackjack) || (playerHasBusted && state.dealerHasBusted) || (dealerScore === playerScore)),
                win: isOver && (playerHasBlackjack || state.dealerHasBusted || playerScore > dealerScore),
                loss: isOver && (playerHasBusted || dealerScore > playerScore)
            }
        }

        getHigherValidValue(values){
            if(values === undefined || (!values.hasOwnProperty('hi') || !values.hasOwnProperty('lo'))) return 0;
            if(values.hi <= 21) return values.hi;
            if(values.lo <= 21) return values.lo;
            return -1; // busted
        }

        playerHasBlackjack(){

            let playerHasBlackjack = false;
            let sides = ['left','right'];
            for(var s=0;s<sides.length;s++) {
                let side = sides[s];
                if (state.handInfo[side].length > 0 && state.handInfo[side].playerHasBlackjack === true) {
                    playerHasBlackjack = true;
                    break;
                }
            }

            return playerHasBlackjack;
        }

        playerHasBusted(){

            let playerHasBusted = false;
            let sides = ['left','right'];
            for(var s=0;s<sides.length;s++) {
                let side = sides[s];
                if (state.handInfo[side].length > 0 && state.handInfo[side].playerHasBusted === true) {
                    playerHasBusted = true;
                    break;
                }
            }

            return playerHasBusted;
        }

        canBet(amount){

            return this.canBetOrError(amount) === true;
        }

        canBetOrError(amount){

            if(amount <= 0) return ERROR.WRONG_BET_AMOUNT;
            if(amount < rules.frontRules.minimumBet) return ERROR.MINIMUM_BET;
            if(amount > rules.frontRules.maximumBet) return ERROR.MAXIMUM_BET;
            if ( ! this.player.balance.compare(amount)) return ERROR.INSUFFICIENT_BALANCE;

            return true;
        }

        getPlayerTurnSide() {

            let side = null;
            if (state.stage === 'player-turn-right') {
                side = 'right';
            } else if (state.stage === 'player-turn-left') {
                side = 'left';
            } else if(state.stage === 'ready'){
                side = 'ready';
            }

            return side;
        }

        canDoAction(currentAction){

            let can = false;
            let side = this.getPlayerTurnSide();
            if(side === null) return false;

            let _currentAction = this.cleanCurrentAction(currentAction); // may come with hitL, standL and if below doesnt work with that L

            if(side === 'ready'){
                can = true;
            }else if(state.hasOwnProperty('handInfo') &&
                state.handInfo.hasOwnProperty(side) &&
                state.handInfo[side].availableActions[_currentAction] === true
            ){
                can = true;
            }

            return can;
        }

        cleanCurrentAction(currentAction){

            if(currentAction.endsWith('L')){
                return currentAction.slice(0,-1);
            }
            return currentAction;
        }

        canBetOnCurrentAction(){

            let canBet = false;
            let side = this.getPlayerTurnSide();

            if(side === null) return false;

            if(side === 'ready') {
                canBet = true;
            }else if( (side === 'left' || side === 'right' ) &&
                state.hasOwnProperty('handInfo') &&
                state.handInfo.hasOwnProperty(side) &&
                state.handInfo[side].availableActions !== undefined &&
                (state.handInfo[side].availableActions.split === true || state.handInfo[side].availableActions.double === true)
            ){
                canBet = true;
            }

            return canBet;
        }

        /*
            return (boolean) true if allowed
            or
            returns (string) error if not
         */
        playerActionsAllowed(action, amount){

            if( action !== undefined && ! this.canDoAction(action)) return ERROR.CANT_DO_ACTION;

            // on split/double, make sure bet is increased
            if((amount === undefined || amount === 0) && (action === 'double' || action === 'split')){
                amount = state.initialBet;
            }

            if(amount > 0){

                if( ! this.canBetOnCurrentAction()) return ERROR.CANT_BET;

                // make sure to check if amount == initial bet
                if (state.initialBet > 0 && amount !== state.initialBet) return ERROR.FAKE_BET_INCREASE;

                let canBetOrError = this.canBetOrError(amount);
                if (canBetOrError !== true) return canBetOrError;

            }

            return true;

        }

        bet(amount){

            amount = parseInt(amount);

            this.currentBet += amount;
            this.player.balance.sub(amount); // subtract amount from player balance

        }

        restore(){
            this.game.dispatch(singleplayer.actions.restore());
            state = this.game.getState();
            return state;
        }

        deal(params){
            this.game.dispatch(singleplayer.actions.deal(params));
            state = this.game.getState();
            return state;
        }

        hit(params){
            this.game.dispatch(singleplayer.actions.hit(params));
            state = this.game.getState();
            return state;
        }

        stand(params){
            this.game.dispatch(singleplayer.actions.stand(params));
            state = this.game.getState();
            return state;
        }

        double(params){
            this.game.dispatch(singleplayer.actions.double(params));
            state = this.game.getState();
            return state;
        }

        split(params){
            this.game.dispatch(singleplayer.actions.split(params));
            state = this.game.getState();
            return state;
        }

        dealer(){
            this.game.dispatch(singleplayer.actions.dealerHit());
            state = this.game.getState();
            return state;
        }

        allowOnlyPublicData(_state, extras){

            // console.log('--------------------------------------------------');
            // console.log('public state', _state);

            // quick history
            let shortHistory = [];
            if(_state.history.length > 0){
                for(let i=0;i<_state.history.length;i++){
                    shortHistory.push(_state.history[i].type);
                }
            }

            let ret = {

                lastAction: this.lastAction,
                currentBet: this.currentBet,
                hits: _state.hits,
                initialBet: _state.initialBet,
                finalBet: _state.finalBet,
                wonOnRight: _state.wonOnRight,
                wonOnLeft: _state.wonOnLeft,
                finalWin: _state.finalWin,
                stage: _state.stage,
                handInfo: _state.handInfo,
                position: this.position, // need to set this on frontend
                history: shortHistory, // shortHistory to check what was triggered while playing
                dealerCards: _state.dealerCards,
                dealerValue: _state.dealerValue,
                dealerHasBlackjack: _state.dealerHasBlackjack,
                dealerHasBusted: _state.dealerHasBusted,
                dealerHiddenCard: _state.dealerHoleCard !== undefined,


            }


            let hasHiddenCard = false;
            for(let i in _state.dealerCards){
                if(_state.dealerCards[i].text == 'hidden'){
                    hasHiddenCard = true;
                }
            }

            if(_state.hasOwnProperty('dealerCards') && _state.dealerCards.length > 0) {
                if (_state.stage === 'showdown' || _state.stage === 'dealer-turn' || _state.stage === 'done') {
                    for (let i in _state.dealerCards) {
                        if (_state.dealerCards[i].text == 'hidden') {
                            _state.dealerCards.splice(i, 1);
                        }
                    }
                } else if (!hasHiddenCard) {
                    ret.dealerCards.push({text: 'hidden', suite: 'hidden', value: 0, color: 'hidden'});
                }
            }

            if(extras !== undefined && typeof extras === 'object'){
                for(let i in extras)
                    ret[i] = extras[i];
            }



            return ret;
        }



    }

    return Blackjack;

})();

module.exports = BlackjackSingleplayer;