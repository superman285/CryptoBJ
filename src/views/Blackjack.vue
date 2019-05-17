<template xmlns:v-bind="http://www.w3.org/1999/xhtml">
    <div class="blackjack">
        <div class="container">
            <div class="blackjack__content">
                <div class="blackjack__table">
                    <!--<div v-if="cheats.enabled" class="cheats">-->
                        <!--<button class="cheats-title" @click="cheats.visible = !cheats.visible">-->
                            <!--#CHEATS-->
                            <!--<small>Click to toggle visiblity</small>-->
                        <!--</button>-->
                        <!--{{/* eslint-disable */}}-->
                        <!--<button v-if="cheats.visible" v-for="(option, index) in cheats.options" @click="triggerCheats(option)" :key="index">-->
                            <!--{{ option.text }}-->
                        <!--</button>-->
                    <!--</div>-->

                    <div v-if="soundsEnabled" class="audio_icon" :class="{ muted: muted }" @click="toggleMute()">
                        <img src="../assets/btn_audio.png" />
                    </div>

                    <div class="blackjack__table--cointray noselect">
                        <!--<img src="../assets/coin_plate.png" alt="coin plate" />-->

                        <div class="hidden-dealer-coins">
                            <CoinsDealer v-bind:dealerPays="game.dealerPays"></CoinsDealer>
                        </div>
                    </div>
                    <div style="display:none" class="blackjack__table--emptydeck noselect">
                        <img src="../assets/empty_card_bundle.png" alt="emptydeck" />
                    </div>
                    <div class="blackjack__table--dealercards">
                        <div class="blackjack__table--dealercards--hand" v-if="game.ready && game.state.dealerCards">
                            <div class="blackjack__table--score dealer-score" v-show="game.cardValues.dealer > 0">
                                {{ game.cardValues.dealer | showCardScore }}
                            </div>

                            <!--    DEALER CARDS   -->

                            <Cards
                                v-bind:cards="game.state.dealerCards"
                                v-bind:state="game.state"
                                v-bind:side="`dealer`"
                                v-bind:animation="game.animations.dealer"
                            ></Cards>
                        </div>
                    </div>
                    <div class="blackjack__table--filldeck noselect">
                        <img src="../assets/fillcardbundle.png" alt="filldeck" />
                    </div>
                    <div class="blackjack__table--label noselect">
                        <img src="../assets/boardlogo.png" alt="" width="100%" height="100%">
                    </div>
                    <div class="blackjack__table--playercards" :class="{ multihand: game.hands > 1 }">
                        <div class="blackjack__table--playercards--hands">
                            <div class="blackjack__table--playercards--hand playercards-hand-left" :class="{ highlight: highlightActiveCards('left') }">
                                <div class="blackjack__table--playercards-wrapper" v-if="game.ready && game.hands > 1 && handHasCards('left')">
                                    <div class="blackjack__table--score player-score" v-show="game.cardValues.left > 0">
                                        {{ game.cardValues.left | showCardScore }}
                                    </div>

                                    <!--    PLAYER CARDS ON LEFT   -->
                                    <Cards
                                        v-bind:cards="game.state.handInfo.left.cards"
                                        v-bind:state="game.state"
                                        v-bind:side="`left`"
                                        v-bind:animation="game.animations.left"
                                    ></Cards>
                                </div>

                                <div class="blackjack__table--playerbetcoins" v-show="game.ready && game.hands > 1 && handHasCards('left')" :class="{betted: game.playerConfirmBet}">
                                    <Coins v-bind:game="game" v-bind:side="`left`" v-bind:calcCoinValue="currentBetAmountPerGroupOfChips"></Coins>

                                    <!--confirm cancel button-->
                                    <div class="confirm-area" v-show="game.prepBet && !game.playerConfirmBet">
                                        <img src="../assets/cancel.png"
                                             alt="cancelbtn"
                                             @click="clearCoins()"
                                        >
                                        <img src="../assets/confirm.png"
                                             alt="confirmbtn"
                                             @click="gameBet('confirm')"
                                        >
                                    </div>

                                </div>
                            </div>

                            <div class="blackjack__table--playercards--hand playercards-hand-right" :class="{ highlight: highlightActiveCards('right') }">
                                <div class="blackjack__table--playercards-wrapper" v-if="game.ready && handHasCards('right')">
                                    <div class="blackjack__table--score player-score" v-show="game.cardValues.right > 0">
                                        {{ game.cardValues.right | showCardScore }}
                                    </div>

                                    <!--    PLAYER CARDS ON RIGHT   -->

                                    <Cards
                                        v-bind:cards="game.state.handInfo.right.cards"
                                        v-bind:state="game.state"
                                        v-bind:side="`right`"
                                        v-bind:animation="game.animations.right"
                                    ></Cards>
                                </div>

                                <div class="blackjack__table--playerbetcoins" :class="{betted: game.playerConfirmBet}">
                                    <Coins v-bind:game="game" v-bind:side="`right`" v-bind:calcCoinValue="currentBetAmountPerGroupOfChips"></Coins>
                                    <!--confirm cancel button-->
                                    <div class="confirm-area" v-show="game.prepBet && !game.playerConfirmBet">
                                        <img src="../assets/cancel.png"
                                             alt="cancelbtn"
                                             @click="clearCoins()"
                                        >
                                        <img src="../assets/confirm.png"
                                             alt="confirmbtn"
                                             @click="gameBet('confirm')"
                                        >
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>


                    <!--confirm cancel button-->
                    <!--<div class="confirm-area" v-show="game.prepBet && !game.playerConfirmBet">
                        <img src="../assets/cancel.png"
                             alt="cancelbtn"
                             @click="clearCoins()"
                        >
                        <img src="../assets/confirm.png"
                             alt="confirmbtn"
                             @click="gameBet('confirm')"
                        >
                    </div>-->

                    <!--addcoin img -->
                    <div class="blackjack__table--coinsrow" v-show="!game.playerConfirmBet">
                        <img src="../assets/10_coin.png"
                             alt="10coin"
                             @click="gameBet('inc',10)"
                        >
                        <img src="../assets/50_coin.png"
                             alt="10coin"
                             @click="gameBet('inc',50)"
                        >
                        <img src="../assets/100_coin.png"
                             alt="10coin"
                             @click="gameBet('inc',100)"
                        >
                        <img src="../assets/500_coin.png"
                             alt="10coin"
                             @click="gameBet('inc',500)"
                        >
                        <img src="../assets/1000_coin.png"
                             alt="10coin"
                             @click="gameBet('inc',1000)"
                        >
                        <img src="../assets/5000_coin.png"
                             alt="10coin"
                             @click="gameBet('inc',5000)"
                        >


                    </div>


                    <!--end game popup-->
                    <transition name="endgame_state">
                        <div class="endgame_state endgame_state_tie" v-if="game.currentAction == 'tie'">
                            <span>It's a tie.</span>
                        </div>
                    </transition>

                    <transition name="endgame_state">
                        <div class="endgame_state endgame_state_win" v-if="game.currentAction == 'win'">
                            <span v-if="game.lastWin > 0">You won {{ game.lastWin }} coins!</span>
                            <span v-else>You have won!</span>
                        </div>
                    </transition>

                    <transition name="endgame_state">
                        <div class="endgame_state endgame_state_loss" v-if="game.currentAction == 'loss'">
                            <span>You lost.</span>
                        </div>
                    </transition>
                </div>


                <div class="blackjack-control-area">
                    <!--MOBILE GAME CONTROLS-->

                    <div class="mobile-controls">
                        <!--<div class="blackjack-control-area-row1">
                            <div class="blackjack-input-bet">
                                <input v-model="customBet" placeholder="Enter your bet" />
                                <button @click="gameBet('input')" :class="{ disabled: !confirmBetEnabled() }">Set</button>
                                <button @click="gameBet('double')">2x</button>
                                <button @click="gameBet('half')">1/2</button>
                            </div>
                        </div>-->

                        <div class="blackjack-control-area-row2">
                            <div class="bet-action-btns-section">
                                <Button
                                    type="button big green clickable"
                                    label="repeat"
                                    @button-clicked="gameBet('repeat')"
                                    :class="{ disabled: !repeatBetEnabled() }"
                                ></Button>
                                <Button
                                    type="button big clickable"
                                    label="deal"
                                    @button-clicked="gameBet('confirm')"
                                    :class="{ disabled: !confirmBetEnabled() }"
                                ></Button>
                            </div>

                            <div class="blackjack-deals-hit-stand-btns" v-if="game.ready">
                                <Button type="button clickable" label="hit" @button-clicked="userAction('hit')" :class="{ disabled: !actionEnabled('hit') }">
                                </Button>

                                <Button
                                    type="button clickable"
                                    label="stand"
                                    @button-clicked="userAction('stand')"
                                    :class="{ disabled: !actionEnabled('stand') }"
                                >
                                </Button>

                                <Button
                                    type="button clickable"
                                    label="double"
                                    @button-clicked="userAction('double')"
                                    :class="{ disabled: !actionEnabled('double') }"
                                >
                                </Button>

                                <Button
                                    type="button clickable"
                                    label="split"
                                    @button-clicked="userAction('split')"
                                    :class="{ disabled: !actionEnabled('split') }"
                                >
                                </Button>
                            </div>
                        </div>

                        <div class="blackjack-control-area-row3">
                            <div class="fate-amount-section">
                                <div class="trx-card">
                                    <div>
                                        <img class="currency-image" src="../assets/trx.png" alt="trx" />
                                        <!--soft balance is frontend based, but gets confirmed once it goes thru backend-->
                                        <h6>{{ player.softBalance | balanceInTrx }} trx</h6>
                                    </div>
                                </div>
                                <div class="fate-card">
                                    <div>
                                        <img class="currency-image" src="../assets/fate.png" alt="fate" />
                                        <h6>0.000 fate</h6>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div class="default-controls">
                        <!--<div class="blackjack-control-area-row1">
                            <div class="blackjack-total-bet-container">
                                <div class="total-bet-amt-card">
                                    <h3>{{ currentTotalBetAmount() }}</h3>
                                    <h4>total bet amount</h4>
                                </div>
                            </div>
                        </div>-->

                        <div class="blackjack-control-area-row2" v-show="game.playerConfirmBet">
                            <!--betting with set values and input|old bet coins way-->
                            <!--<div class="blackjack-input-bet">
                                <input v-model="customBet" placeholder="Enter your bet" />
                                <button @click="gameBet('input')" :class="{ disabled: !confirmBetEnabled() }">Set</button>
                                <button @click="gameBet('set', 20)" :class="{ disabled: !confirmBetEnabled() }">20 TRX</button>
                                <button @click="gameBet('set', 100)" :class="{ disabled: !confirmBetEnabled() }">100 TRX</button>
                                <button @click="gameBet('set', 500)" :class="{ disabled: !confirmBetEnabled() }">500 TRX</button>
                            </div>

                            <div class="bet-btns-section">
                                <button @click="gameBet('double')">2x</button>
                                <button @click="gameBet('half')">1/2</button>
                                <button @click="gameBet('min')">min</button>
                                <button @click="gameBet('max')">max</button>
                            </div>-->

                            <!--<div class="bet-action-btns-section">
                                <Button
                                    type="button big green clickable mr-2"
                                    label="repeat"
                                    @button-clicked="gameBet('repeat')"
                                    :class="{ disabled: !repeatBetEnabled() }"
                                ></Button>
                                <Button
                                    type="button big clickable"
                                    label="deal"
                                    @button-clicked="gameBet('confirm')"
                                    :class="{ disabled: !confirmBetEnabled() }"
                                ></Button>
                            </div>-->
                            <div class="blackjack-deals-hit-stand-btns" v-if="game.ready">

                                <Button type="button clickable" label="draw" @button-clicked="drawMethod()">
                                        <!--:class="{ disabled: !actionEnabled('draw') }"-->
                                </Button>

                                <Button type="button clickable" label="hit" @button-clicked="userAction('hit')" :class="{ disabled: !actionEnabled('hit') }">
                                </Button>

                                <Button
                                    type="button clickable"
                                    label="stand"
                                    @button-clicked="userAction('stand')"
                                    :class="{ disabled: !actionEnabled('stand') }"
                                >
                                </Button>

                                <Button
                                    type="button clickable"
                                    label="double"
                                    @button-clicked="userAction('double')"
                                    :class="{ disabled: !actionEnabled('double') }"
                                >
                                </Button>

                                <Button
                                    type="button clickable"
                                    label="split"
                                    @button-clicked="userAction('split')"
                                    :class="{ disabled: !actionEnabled('split') }"
                                >
                                </Button>
                            </div>

                        </div>

                        <div class="blackjack-control-area-row3">
                            <div class="fate-amount-section">
                                <div class="trx-card">
                                    <div>
                                        <img class="currency-image" src="../assets/trx.png" alt="trx" />
                                        <!--soft balance is frontend based, but gets confirmed once it goes thru backend-->
                                        <h6>{{ player.softBalance | balanceInTrx }} trx</h6>
                                    </div>
                                </div>
                                <div class="fate-card">
                                    <div>
                                        <img class="currency-image" src="../assets/fate.png" alt="fate" />
                                        <h6>0.000 fate</h6>
                                    </div>
                                </div>
                            </div>

                            <!--old 4 buttons-->
                            <!--<div class="blackjack-deals-hit-stand-btns" v-if="game.ready">
                                <Button type="button clickable" label="hit" @button-clicked="userAction('hit')" :class="{ disabled: !actionEnabled('hit') }">
                                </Button>

                                <Button
                                    type="button clickable"
                                    label="stand"
                                    @button-clicked="userAction('stand')"
                                    :class="{ disabled: !actionEnabled('stand') }"
                                >
                                </Button>

                                <Button
                                    type="button clickable"
                                    label="double"
                                    @button-clicked="userAction('double')"
                                    :class="{ disabled: !actionEnabled('double') }"
                                >
                                </Button>

                                <Button
                                    type="button clickable"
                                    label="split"
                                    @button-clicked="userAction('split')"
                                    :class="{ disabled: !actionEnabled('split') }"
                                >
                                </Button>
                            </div>-->
                        </div>
                    </div>


                </div>

                <div class="blackjack-tablearea">
                    <div class="blackjack-tablearea-firstRow">
                        <Button type="button huge clickable" class="mr-4" label="my bets"></Button>
                        <Button type="button huge red-outline clickable" label="all bets"></Button>
                    </div>

                    <div class="blackjack-tablearea-table">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Player</th>
                                    <th>Time</th>
                                    <th>Bet</th>
                                    <th>Roll Under</th>
                                    <th>Roll Over</th>
                                    <th>Roll</th>
                                    <th>Payout</th>
                                    <th>
                                        <Button type="button fate-btn" label="fate"></Button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>TB3A...1267</td>
                                    <td>21:19:48</td>
                                    <td>299</td>
                                    <td>96</td>
                                    <td>96</td>
                                    <td>60</td>
                                    <td class="payout-text">310,0157</td>
                                    <td>134,55</td>
                                </tr>
                                <tr>
                                    <td>TB3A...1267</td>
                                    <td>21:19:48</td>
                                    <td>299</td>
                                    <td>96</td>
                                    <td>96</td>
                                    <td>60</td>
                                    <td class="payout-text">310,0157</td>
                                    <td>134,55</td>
                                </tr>
                                <tr>
                                    <td>TB3A...1267</td>
                                    <td>21:19:48</td>
                                    <td>299</td>
                                    <td>96</td>
                                    <td>96</td>
                                    <td>60</td>
                                    <td class="payout-text">310,0157</td>
                                    <td>134,55</td>
                                </tr>
                                <tr>
                                    <td>TB3A...1267</td>
                                    <td>21:19:48</td>
                                    <td>299</td>
                                    <td>96</td>
                                    <td>96</td>
                                    <td>60</td>
                                    <td class="payout-text">310,0157</td>
                                    <td>134,55</td>
                                </tr>
                                <tr>
                                    <td>TB3A...1267</td>
                                    <td>21:19:48</td>
                                    <td>299</td>
                                    <td>96</td>
                                    <td>96</td>
                                    <td>60</td>
                                    <td class="payout-text">310,0157</td>
                                    <td>134,55</td>
                                </tr>
                                <tr>
                                    <td>TB3A...1267</td>
                                    <td>21:19:48</td>
                                    <td>299</td>
                                    <td>96</td>
                                    <td>96</td>
                                    <td>60</td>
                                    <td class="payout-text">310,0157</td>
                                    <td>134,55</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script src="./Blackjack.js"></script>
<style lang="scss" src="./Blackjack.scss" scoped />
