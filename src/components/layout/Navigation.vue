<template>
    <div class="container">
        <div class="navigation">
            <img class="cutLeft" src="../../assets/cutleft.png" alt="leftcut" />
            <div class="nav-item">
                <div :class="{ active: isActiveClass('/') }"></div>
                <router-link to="/">
                    <img src="../../assets/game.png" alt="game" />
                </router-link>
                <span>Game</span>
            </div>

            <div class="nav-item">
                <div :class="{ active: isActiveClass('/dice') }"></div>
                <router-link to="/dice">
                    <img src="../../assets/diceicon.png" alt="dice" />
                </router-link>
                <span>Dice Game</span>
            </div>
            <div class="nav-item">
                <div :class="{ active: isActiveClass('/blackjack') }"></div>
                <!-- <router-link to="/blackjack"> -->
                <img src="../../assets/blacjackicon.png" alt="game" @click="showComingModal" />
                <!-- </router-link> -->
                <span>Blackjack</span>
            </div>
            <div class="nav-item">
                <img @click="showReferralModal" src="../../assets/referral_icon.png" alt="game" />
                <span>Referral</span>
            </div>
            <div class="nav-item">
                <img @click="showDividendsModal" src="../../assets/dividendsicon.png" alt="game" />
                <span>Dividends</span>
            </div>
            <img class="cutRight" src="../../assets/cutright.png" alt="rightcut" />
        </div>
    </div>
</template>

<script src="./Navigation.js"></script>
<style lang="scss" src="./Navigation.scss" scoped />
