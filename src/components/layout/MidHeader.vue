<template>
    <div class="midheader">
        <div class="container">
            <div class="midheader-container">
                <div class="title">
                    <span>Crypto</span>
                    <span>Fate</span>
                </div>
                <div class="menu">
                    <div class="left-menu">
                        <div class="right-side">
                            <img src="../../assets/Twwiter.png" alt="twitter" />
                            <img src="../../assets/Telegram.png" alt="telegram" />
                            <img src="../../assets/disc.png" alt="disc" />
                            <img src="../../assets/wechat.png" alt="wechat" />
                        </div>
                        <span v-if="loged" class="account"
                            ><a href="javascript:;">{{ shortAddress }}</a></span
                        >
                        <button v-if="!loged" class="login-btn" @button-clicked="showLoginModal">Login</button>
                    </div>
                    <div class="right-menu">
                        <!--
                        <div class="menu-item">
                            <img @click="onWalletClick" class="menu-img" src="../../assets/wallet.png" alt="wallet" />
                        </div> -->
                        <a class="select-language">
                            <span>{{ localeLabel }} <i class="dropdown-arrow"/></span>
                            <ul>
                                <li v-for="(name, value) in locales" v-bind:key="value">
                                    <a href="javascript:;" @click="setLocale(value)">{{ name }}</a>
                                </li>
                            </ul>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script src="./MidHeader.js"></script>
<style lang="scss" src="./MidHeader.scss" scoped />
