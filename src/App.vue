<template>
    <div id="app">
        <TopHeader></TopHeader>
        <MidHeader></MidHeader>
        <Navigation></Navigation>
        <router-view />
        <Footer></Footer>

        <!--
        <div class="toastMask show">
            <div class="content">自动下注 3 ...</div>
        </div> -->

        <div :class="betResultClasses">
            <div class="content" v-if="lottery && !lotteryNumMarksIntrupted">
                <p>
                    {{ lottery.state > 0 ? 'Congratulations' : 'Unfortunately' }},you bet <code>{{ lottery.betamountInTrx }}</code> TRX
                </p>
                <p>
                    Roll result <code>{{ lottery.lotterynum }}</code> , {{ lottery.state > 0 ? 'win' : 'lost' }}
                    <code>{{ lottery.state > 0 ? lottery.winamountInTrx : lottery.betamountInTrx }}</code> TRX
                </p>
            </div>
        </div>

        <!-- bet error Modal | timeout Modal -->
        <Modal v-if="betErrorModal" width="400px" :closable="false">
            <div slot="body">
                <div class="betErrorModal">
                    <div class="betErrorModal-content">
                        <h1>{{betErrorModal}}</h1>
                    </div>
                </div>
            </div>
        </Modal>

        <!-- Not Enough Balance Modal --->
        <Modal v-if="notEnoughBalanceModal" width="400px" :closable="false">
            <div slot="body">
                <div class="notEnoughBalanceModal">
                    <div class="notEnoughBalanceModal-content">
                        <img src="./assets/not_enough_balance.png" alt="not enough" />
                        <h1>Not Enough Balance</h1>
                    </div>
                </div>
            </div>
        </Modal>

        <!-- BJ tips Modal -->
        <Modal v-if="bjTipsModal" width="400px" @close="closeBjTipsModal">
            <div slot="body">
                <div class="bjTipsModal">
                    <div class="bjTipsModal-content">
                        <img src="./assets/confirm.png" alt="bjtips" />
                        <h1>{{bjTipsModal}}</h1>
                    </div>
                </div>
            </div>
        </Modal>

        <!-- BJ recharge Modal -->
        <Modal v-if="bjRechargeModal"
               width="600px"
               @close="closeBjRechargeModal"
        >
            <div slot="body">
                <div class="bjRechargeModal">
                    <h2>Recharge</h2>
                    <div class="bjRechargeModal-content">
                        <div class="recharge-tabs">
                            <button :class="{active:blackjack.bjRechargeTab=='tab_recharge'}"
                                    class="tab"
                                    @click="blackjack.bjRechargeTab='tab_recharge'"
                            >Recharge</button>
                            <button :class="{active:blackjack.bjRechargeTab=='tab_withdraw'}"
                                    class="tab"
                                    @click="blackjack.bjRechargeTab='tab_withdraw'"
                            >Withdraw</button>
                        </div>
                        <div v-show="blackjack.bjRechargeTab=='tab_withdraw'">
                        <!--<label for="text"><input id="text" type="text" > TRX</label>-->
                            <div class="input-div">
                                <input id="withdraw" :value="blackjack.input_withdrawVal" type="number" placeholder="Please enter the amount">
                                <span>TRX</span>
                            </div>

                            <div class="recharge-btn">
                                <span class="trxbal">Maximum available: {{bjBalance}} trx</span>
                                <Button class="recharge-wbtn"
                                        label="withdraw"
                                        type="button big green clickable"
                                        @button-cliked="bjWithdraw"
                                ></Button>
                            </div>
                        </div>
                        <div v-show="blackjack.bjRechargeTab=='tab_recharge'">
                            <div class="input-div">
                                <input :value="blackjack.input_rechargeVal" type="number" placeholder="Please enter the amount">
                                <span>TRX</span>
                            </div>
                            <div class="recharge-btn">
                            <Button class="recharge-rbtn"
                                    label="recharge"
                                    type="button big green clickable"
                                    @button-cliked="bjRecharge"
                            ></Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>

        <!--- Dividend Modal  --->
        <Modal v-if="dividendsModal" width="700px" @close="closeDividendsModal">
            <div slot="body">
                <div class="dividendModal">
                    <h1>FATE Mining Progress</h1>
                    <p>Play 10,00 TRX to Get 1 FATE</p>
                    <div class="dividend-bar">
                        <div class="bar-fill"></div>
                    </div>
                    <h2>Available Dividends</h2>
                    <h3>1000,000,00 TRX</h3>
                    <div class="cards-row">
                        <div class="dividend-card">
                            <div>Total Frozen</div>
                            <div class="frozen-count">1000,000,00 FATE</div>
                        </div>
                        <div class="dividend-card">
                            <div>Dividends Countdown</div>
                            <div class="frozen-count">23:25:59</div>
                        </div>
                    </div>
                    <div class="dividend-last-row">
                        <div class="dividend-last-row-col">
                            <div class="dividend-last-row-col-title">Available</div>
                            <div class="dividend-last-row-col-card div-available-card">10,000 FATE</div>
                            <Button @button-clicked="openNotEnoughModal" type="button big clickable" label="withdrawn"></Button>
                        </div>
                        <div class="dividend-last-row-col">
                            <div class="dividend-last-row-col-title">Widthrawn</div>
                            <div class="dividend-last-row-col-card div-withdrawn-card">10,000 FATE</div>
                            <Button @button-clicked="showFreezeModal" type="button big clickable" label="freeze"></Button>
                        </div>
                        <div class="dividend-last-row-col">
                            <div class="dividend-last-row-col-title">Frozen</div>
                            <div class="dividend-last-row-col-card div-frozen-card">10,000 FATE</div>
                            <Button @button-clicked="showUnfreezeModal" type="button big clickable" label="unfreeze"></Button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>

        <!-- Refferal Modal -->
        <Modal v-if="referralModal" width="700px" @close="closeReferralModal">
            <div slot="body">
                <div class="referralModal">
                    <h1>Get Reward Just by Refering Your Friends!</h1>
                    <div class="copy-link-div">
                        <input type="text" ref="copyLink" readonly :value="tempReferralLink" />
                        <button @click="copyToClipBoard" class="copy-link-btn">Copy Link</button>
                    </div>
                    <div class="copy-link-points">
                        <ul>
                            <li>Recieve 02% of all their winnings</li>
                            <li>All rewards are send out automatically through our smart contracts</li>
                            <li>Just copy the link above and share it to all the friends!</li>
                        </ul>
                    </div>
                </div>
            </div>
        </Modal>

        <!-- Freezable Modal --->
        <Modal v-if="freezeModal" width="600px" @close="closeFreezeModal">
            <div slot="body">
                <div class="freezableModal">
                    <h1>Freezable</h1>
                    <h2>0.287 Fate</h2>
                    <div class="freezable-input-div">
                        <input value="0.287" type="number" />
                        <Button type="button rectangle clickable" label="all"></Button>
                    </div>
                    <Button type="button clickable" label="confirm"></Button>
                </div>
            </div>
        </Modal>

        <!-- Un Freezable Modal --->
        <Modal v-if="unfreezeModal" width="600px" @close="closeUnfreezeModal">
            <div slot="body">
                <div class="freezableModal">
                    <h1>UnFreezable</h1>
                    <h2>0 Fat</h2>
                    <div class="freezable-input-div">
                        <input value="0" type="number" />
                        <Button type="button rectangle clickable" label="all"></Button>
                    </div>
                    <Button type="button clickable" label="confirm"></Button>
                </div>
            </div>
        </Modal>

        <!-- Loading Modal --->
        <Modal v-if="loadingText" width="600px" :closable="false">
            <div slot="body">
                <div class="loadingModal">
                    <h1>{{ loadingText || 'Loading...' }}</h1>
                </div>
            </div>
        </Modal>

        <!-- Loading Modal --->
        <!--
        <Modal v-if="!mainnet" width="600px" :closable="false">
            <div slot="body">
                <div class="mainnetModal">
                    <h1>请切换到主网</h1>
                </div>
            </div>
        </Modal> -->

        <Modal v-if="comingModal" width="600px" @close="closeComingModal">
            <div slot="body">
                <div class="comingModal">
                    <h1>COMING SOON ...</h1>
                </div>
            </div>
        </Modal>

        <Modal v-if="loginModal" width="600px" @close="closeLoginModal">
            <div slot="body">
                <div class="loginModal">
                    <h1>提示</h1>
                    <p>如果您没有安装 TRON 钱包，请您点击以下链接下载</p>
                    <p>
                        TronLink :
                        <a href="https://chrome.google.com/webstore/detail/tronlink/ibnejdfjmmkpcnlpebklmnkoeoihofec" target="_blank">http://bit.ly/2L4wzO4</a>
                        <br />
                        TronPay :
                        <a href="https://chrome.google.com/webstore/detail/tronpay/gjdneabihbmcpobmfhcnljaojmgoihfk?hl=zh-CN" target="_blank"
                            >http://bit.ly/2L9H7vi</a
                        >
                        <br />
                        qPocket :
                        <a href="https://qpocket.io/" target="_blank">https://qpocket.io/</a>&nbsp;&nbsp;(iOS and Android)
                    </p>
                    <p>请注意钱包使用主网，勿切换至测试网；<br />登录钱包或切换账户后请刷新页面再开始游戏。</p>
                    <br /><br />
                    <Button type="button huge clickable" label="OK" @button-clicked="closeLoginModal"></Button>
                </div>
            </div>
        </Modal>
    </div>
</template>

<script src="./App.js"></script>
<style lang="scss" src="./App.scss" scoped />
