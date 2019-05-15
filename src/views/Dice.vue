<template>
    <div class="dicepage">
        <div class="container">
            <div class="dice-playarea">
                <div class="rowOne">
                    <div class="bet-amount-div">
                        <h3>Bet amount</h3>
                        <div class="bet-amount">
                            <div class="trx-input-div">
                                <input v-model="trxInputValue" class="trx-input" type="number" />
                                <div class="trxlabel">TRX</div>
                            </div>
                            <div class="bet-amount-btns">
                                <button class="bet-btn" @click="onHalfBtnClick">1/2</button>
                                <button class="bet-btn" @click="onTwoXBtnClick">2X</button>
                                <button class="bet-btn" @click="onMinBtnClick">MIN</button>
                                <button class="bet-btn" @click="onMaxBtnClick">MAX</button>
                            </div>
                        </div>
                    </div>
                    <div class="payout-win-div">
                        <h3>payout on win</h3>
                        <div class="payout-win">
                            <div class="payout-amt">{{ payoutOnWin.toFixed(4) }}</div>
                            <div class="trxlabel">TRX</div>
                        </div>
                    </div>
                </div>
                <div class="rowTwo">
                    <div class="row-2-item">
                        <div class="row-2-title">{{ rollText }}</div>
                        <div class="row-2-value">
                            {{ rangeValue }}
                            <img :style="currentArrow" src="../assets/down_arrow.png" alt="arrow" />
                        </div>
                    </div>
                    <!--
                    <div class="row-2-item">
                        <div class="row-2-title">Your Roll</div>
                        <div class="row-2-value">{{ rangeValue }}</div>
                    </div> -->
                    <div class="row-2-item">
                        <div class="row-2-title">Win Chance</div>
                        <div class="row-2-value">{{ winChances }} %</div>
                    </div>
                    <div class="row-2-item">
                        <div class="row-2-title">Payout</div>
                        <div class="row-2-value">{{ payoutMulti.toFixed(4) }} X</div>
                    </div>
                </div>
                <div class="rowThree">
                    <Button @button-clicked="handleRollUnder" :type="getRollUnderBtnType" class="mr-2" label="roll under"></Button>
                    <Button @button-clicked="handleRollOver" :type="getRollOverBtnType" label="roll over"></Button>
                </div>
                <div class="rowFour">100</div>
                <vue-slider v-model="rangeValue" v-bind="rollType === 'roll-under' ? rollUnderRange : rollOverRange" :marks="lotteryNumMarks" />
                <div class="rowFive">
                    <div class="auto-bet-div">
                        <h6>Auto Bet</h6>
                        <div>
                            <label class="switch">
                                <input type="checkbox" v-model="autobet" />
                                <span class="slider round"></span>
                            </label>
                        </div>
                        <div
                            class="help-box"
                            data-text="WARNING: Turning Auto Bet on will result in your bet continuing to be placed until Auto Bet is turned off. There may be a slight delay when turning Auto Bet off that results in an additional roll."
                            data-text-zh="开启自动投注后，将会按当前投注设定自动投注直至取消，取消会有一两秒延迟，敬请留意 "
                        >
                            <img src="../assets/question.png" alt="help" />
                        </div>
                    </div>
                    <div class="sound-div">
                        <img @click="soundHandler" :src="getSoundImg()" />
                    </div>
                </div>
                <div class="rowSixth">
                    <div class="totalTrx">
                        <img src="../assets/trx.png" alt="trx" />
                        {{ formatedBalance }}
                        <span>trx</span>
                    </div>
                    <Button
                        class="betBtn"
                        :disabled="isrolling || autobet"
                        v-if="loged"
                        type="button huge clickable"
                        :label="betButtonLabel"
                        @button-clicked="handleBetClick"
                    ></Button>
                    <Button v-else type="button huge clickable" label="login" @button-clicked="handleLoginClick"></Button>
                    <div class="totalFate">
                        <img src="../assets/fate.png" alt="trx" />
                        0,000
                        <span>fate</span>
                    </div>
                </div>
            </div>

            <div class="dice-tablearea">
                <div class="dice-tablearea-firstRow">
                    <Button @button-clicked="handleMyBetClick" :type="getMyBetBtnType" class="mr-4" label="my bets"></Button>
                    <Button @button-clicked="handleAllBetClick" :type="getAllBetBtnType" label="all bets"></Button>
                </div>

                <div class="dice-tablearea-table">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Player</th>
                                <th>Time</th>
                                <th>Bet</th>
                                <th>Roll Under/Over</th>
                                <th>Roll</th>
                                <th>Payout</th>
                                <!--
                                <th>
                                    <Button type="button fate-btn" label="fate"></Button>
                                </th> -->
                            </tr>
                        </thead>
                        <tbody>
                            <template v-if="bets.length > 0">
                                <tr v-for="(bet, idx) in bets" :key="idx">
                                    <td>{{ bet.playerAddressShort }}</td>
                                    <td>{{ bet.ctimeShort }}</td>
                                    <td>{{ bet.betamountInTrx }}</td>
                                    <td v-if="bet.rolltype === 1">OVER {{ bet.rollnum }}</td>
                                    <td v-if="bet.rolltype === 2">UNDER {{ bet.rollnum }}</td>
                                    <td>{{ bet.lotterynum }}</td>
                                    <td class="payout-text">{{ bet.winamountInTrx }}</td>
                                    <!-- <td>-</td> -->
                                    <!--
                                    <td>TB3A...1267</td>
                                    <td>21:19:48</td>
                                    <td>299</td>
                                    <td>68</td>
                                    <td>70</td>
                                    <td>58</td>
                                    <td class="payout-text">310,0157</td>
                                    <td>134,55</td>
                                    -->
                                </tr>
                            </template>
                            <template v-if="bets.length <= 0">
                                <tr>
                                    <td colspan="7" style="color:#666;">no data</td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script src="./Dice.js"></script>
<style lang="scss" src="./Dice.scss" scoped />
