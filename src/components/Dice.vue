<template>
    <b-container class="dice">
        <h3>{{ msg }}</h3>
        <b-row>
            <b-col md="8">
                <b-form-group
                    id="betAmount"
                    description="Bet Amount"
                    label="BET AMOUNT"
                    label-for="inputBetAmount"
                    :invalid-feedback="invalidFeedback"
                    :valid-feedback="validFeedback"
                    :state="state"
                >
                    <b-input-group prepend="TRON">
                        <b-form-input id="inputBetAmount" :state="state" v-model.trim="bet_amount"></b-form-input>
                        <b-input-group-append>
                            <b-input-group-text>TRX</b-input-group-text>
                            <b-btn variant="outline-secondary" @click="doubleBet">2X</b-btn>
                            <b-btn variant="outline-secondary" @click="halfBet">1/2</b-btn>
                            <b-btn variant="outline-secondary" @click="minBet">MIN</b-btn>
                            <b-btn variant="outline-secondary" @click="maxBet">MAX</b-btn>
                        </b-input-group-append>
                    </b-input-group>
                </b-form-group>
            </b-col>
            <b-col md="4">
                <b-form-group id="payoutOnWin" description="Payout on Win" label="PAYOUT ON WIN" label-for="inputPayoutOnWin">
                    <b-input-group prepend="TRON" append="TRX">
                        <b-form-input id="inputPayoutOnWin" :value="payout_on_win" disabled></b-form-input>
                    </b-input-group>
                </b-form-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-form-group id="rollToWin" :label="roll_to_win_label" label-for="inputRollToWin">
                    <b-form-input id="inputRollToWin" :value="roll_to_win" disabled></b-form-input>
                </b-form-group>
            </b-col>
            <b-col>
                <b-form-group id="payout" label="PAYOUT" label-for="inputPayout">
                    <b-input-group append="X">
                        <b-form-input id="inputPayout" :value="payout" disabled></b-form-input>
                    </b-input-group>
                </b-form-group>
            </b-col>
            <b-col>
                <b-form-group id="winChance" label="WIN CHANCE" label-for="inputWinChance">
                    <b-input-group append="%">
                        <b-form-input id="inputWinChance" :value="win_chance" disabled></b-form-input>
                    </b-input-group>
                </b-form-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-button variant="primary" @click="rollunder">ROLL UNDER</b-button>
            </b-col>
            <b-col>
                <b-button variant="primary" @click="rollover">ROLL OVER</b-button>
            </b-col>
        </b-row>
        <b-row class="my-5">
            <vue-slider ref="slider" v-model.trim="vue_slider.value" v-bind="vue_slider" @callback="sliderChange"></vue-slider>
        </b-row>
        <b-row align-h="center" class="my-3">
            <b-col cols="5">
                You have <strong id="tronBalance" style="color:blue">{{ tron_balance }}</strong> TRX
                <br />
                Your adress: <strong id="tronAddress" style="color:blue">{{ tron_address }}</strong>
            </b-col>
            <b-col cols="2">
                <b-button size="lg" variant="success" @click="bet">BET</b-button>
            </b-col>
            <b-col cols="5"> </b-col>
        </b-row>
    </b-container>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<script src="./Dice.js"></script>
<style scoped></style>
