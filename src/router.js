import Vue from 'vue';
import Router from 'vue-router';

import Game from './views/Game.vue';

Vue.use(Router);

const router = new Router({
    mode: 'hash',
    routes: [
        {
            path: '/',
            name: 'game',
            component: () => import('./views/Game.vue'),
        },
        {
            path: '/dice',
            name: 'dice',
            component: () => import('./views/Dice.vue'),
        },
        {
            path: '/blackjack',
            name: 'blackjack',
            component: () => import('./views/Blackjack.vue'),
        },
    ],
});

export default router;
