<template>
    <div class="game">
        <section class="content">
            <div class="container">
                <div class="trxCards">
                    <div class="row text-center">
                        <div class="col-12 col-md-6">
                            <div class="scoreCard">
                                <div class="scoreCard-content">
                                    <h1>185,774,100</h1>
                                    <h4>Total Volumes</h4>
                                    <!-- <h4>{{ $t("message.hello") }}</h4> -->
                                    <h6>[trx]</h6>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-6">
                            <div class="scoreCard">
                                <div class="scoreCard-content">
                                    <h1>456,235,390</h1>
                                    <h4>Total Dividens</h4>
                                    <h6>[trx]</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="ourGames">Our Games</div>
                <div class="gamesList text-center">
                    <div class="row">
                        <div class="col-12 col-md-4 col-lg-4">
                            <div class="gameCard">
                                <img src="../assets/dice.png" class="img-fluid gameImg" alt="dice img" />
                                <router-link to="/dice">
                                    <img src="../assets/play_now_button.png" class="img-fluid btnImg" alt="dice playnow" />
                                </router-link>
                            </div>
                        </div>
                        <div class="col-12 col-md-4 col-lg-4">
                            <div class="gameCard">
                                <img src="../assets/blackjack.png" class="img-fluid gameImg" alt="blackjack img" />
                                <router-link to="/blackjack">
                                    <img src="../assets/play_now_button.png" class="img-fluid btnImg" alt="blackjack playnow" />
                                </router-link>
                            </div>
                        </div>
                        <div class="col-12 col-md-4 col-lg-4">
                            <div class="gameCard">
                                <img src="../assets/craps.png" class="img-fluid gameImg" alt="craps img" />
                                <img src="../assets/coming_soon_button.png" class="img-fluid btnImg" alt="craps comingsoon" />
                            </div>
                        </div>
                        <div class="col-12 col-md-4 col-lg-4">
                            <div class="gameCard">
                                <img src="../assets/baccarat.png" class="img-fluid gameImg" alt="baccarat img" />
                                <img src="../assets/coming_soon_button.png" class="img-fluid btnImg" alt="baccarat comingsoon" />
                            </div>
                        </div>
                        <div class="col-12 col-md-4 col-lg-4">
                            <div class="gameCard">
                                <img src="../assets/texas_hold_em.png" class="img-fluid gameImg" alt="texas img" />
                                <img src="../assets/coming_soon_button.png" class="img-fluid btnImg" alt="texas comingsoon" />
                            </div>
                        </div>
                        <div class="col-12 col-md-4 col-lg-4">
                            <div class="gameCard">
                                <img src="../assets/blackjack_multiplayer.png" class="img-fluid gameImg" alt="bm" />
                                <img src="../assets/coming_soon_button.png" class="img-fluid btnImg" alt="multiplayer cs" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script src="./Game.js"></script>
<style lang="scss" src="./Game.scss" scoped />
