<template xmlns:v-bind="http://www.w3.org/1999/xhtml">

  <div class="coins-holder">

    <div class="dealer-coins">

      <transition-group
            tag="div"
            name="coins-dealer"
            v-on:before-enter="onBeforeEnter"
            v-on:enter="onEnterTransition"
            v-on:after-enter="onAfterEnter"
      >
        <img v-for="(coin,index) in dealerPays.slice().reverse()"
             v-if="dealerPays.length > 0 && index <= 2"
             v-bind:data-index="index"
             :key="index"
             :class="`coin-image coin-index-${index}`"
             :src="getCoinImage(coin.value)"
        />
      </transition-group>

    </div>

  </div>

</template>

<script>
export default {
  name: "CoinsDealer",
  data(){
      return {
          entryAnimationSpeed: 1.2, // default 0.7
      }
  },
  props: {
    dealerPays:{
        type: Array,
        required: true,
    }
  },
  methods:{

      getCoinImage(coin){
          return require("@/assets/"+coin+"_coin.png"); // in js
      },

      onBeforeEnter(el){

          // make sure element is hidden
          el.style.opacity = 0;

      },

      onAfterEnter(el){
          el.style.opacity = 0; // make sure it stays hidden
      },

      onEnterTransition(el){

          const delayToStart = 0.1 + parseInt(el.dataset.index) * 0.1;
          const animationSpeed = this.entryAnimationSpeed; // must be less than 1
          const coinsPosition = el.getBoundingClientRect();
          let x=0, y=0;

          console.log('delay coins delay #'+el.dataset.index, delayToStart);

//          const dealerCoins = document.getElementsByClassName('blackjack__table--cointray')[0];
//          const dealerPosition = dealerCoins.getBoundingClientRect();

          const table = document.getElementsByClassName('blackjack__table')[0];
          const tablePos = table.getBoundingClientRect();

          y = tablePos.height + coinsPosition.height;

            console.log('works #'+el.dataset.index);

            const timeline = new TimelineLite();

            timeline.delay(delayToStart)

            timeline.set(el,{
                opacity: 1,
            });
            timeline.to(el, animationSpeed, {
                x: x,
                y: y,
            }, delayToStart);

            timeline.to(el, 0.1, {
                opacity: 0,
            }, "-=0.2" );

            timeline.play();

      },


  },
};
</script>
<style lang="scss" src="./css/Coins.scss" scoped />