<template xmlns:v-bind="http://www.w3.org/1999/xhtml">

  <div class="coins-holder">

    <div class="player-coins"
         v-for="n in checkDoubleBet" :key="`coin_${n}`">

      <transition-group
            tag="div"
            name="coins"
            v-on:leave="onLeaveTransition"
            :duration="{leave: 1000}"
      >

        <img v-for="(coin,index) in game.betHistory"
             v-if="game.betHistory.length > 0 && index <= 2"
             v-show="coin.show"
             :key="index"
             v-bind:data-index="index"
             :class="`coin-image coin-index-${index}`"
             :src="getCoinImage(coin.value)"
        />
      </transition-group>

      <transition name="coins-total">
        <div class="hand-bet-total"
             v-show="totalBetVisible && game.betHistory.length > 0">
          {{ calcCoinValue() }}
        </div>
      </transition>


    </div>

  </div>

</template>

<script>
export default {
  name: "Coins",
  data(){
      return {
          leaveAnimationSpeed: 0.6,
          totalBetVisible: false,
      }
  },
  props: {
    game:{
        type: Object,
        required: true,
    },
    side:{
        type: String,
        required: true,
        default: 'right', // valid values: 'right' or 'left'
    },
    calcCoinValue: { // currentBetAmountPerGroupOfChips
        type: Function,
        required: true,
    }
  },
  mounted(){

      let vm = this;
      this.$root.$on('coinsTotalBetVisible', (value)=>{
          vm.totalBetVisible = !!value;
      })


  },
  methods:{

      getCoinImage(coin){
          return require("@/assets/"+coin+"_coin.png"); // in js
      },


      onEnterTransition(el){

          // it looks weird with coins entering.. because not all coins get recreated, so advice to not use enter animation on coins

          let animationSpeed = 0.6;
          let x = 0;
          let y = 200;

          const timeline = new TimelineLite();

          timeline.set(el,{
              x: x,
              y: y,
              opacity: 0,
          })

          // opacity works 2x faster than other transition
          timeline.to(el, animationSpeed/2, {
              opacity: 1,
          }, 0);

          timeline.to(el, animationSpeed, {
              x: 0,
              y: 0,
          }, 0);

          timeline.play();

      },

      onLeaveTransition(el){

          // make sure game has ended
          if(this.game.state.stage !== 'done') return;

          const animationSpeed = this.leaveAnimationSpeed; // must be less than 1
          const coinsPosition = el.getBoundingClientRect();
          let x=0, y=0;
          let playerWon = false;

          if(this.side === 'left' && this.game.state.wonOnLeft > 0){
              playerWon = true;
          }else if(this.side === 'right' && this.game.state.wonOnRight > 0){
              playerWon = true;
          }

          if( ! playerWon ){ // if player losses - animate coins going to dealer

              const dealerCoins = document.getElementsByClassName('blackjack__table--cointray')[0];
              const dealerPosition = dealerCoins.getBoundingClientRect();

              y = dealerPosition.top - coinsPosition.top + (coinsPosition.height/2);

              let centerOfDealerCoins = (dealerPosition.width / 2) - (coinsPosition.width / 2);
              x = dealerPosition.x - coinsPosition.x + centerOfDealerCoins;

          }else{ // win & tie - give coins back to player

              const table = document.getElementsByClassName('blackjack__table')[0];
              const tablePos = table.getBoundingClientRect();

              y = (tablePos.top + tablePos.height - coinsPosition.y) + coinsPosition.height;
              x = 0;
          }

          const timeline = new TimelineLite();

          timeline.to(el, animationSpeed, {
              x: x,
              y: y,
          });
          timeline.to(el, 0.1, {
              opacity: 0,
          }, "-=0.2" ); // this acts as a delay, when coin finishes moving, it disapears

          // vuejs sets element visibility to "display: none" after 1s as defined in coins.scss at .coins-leave-active{}

          timeline.play();

      },

  },
  computed:{
      checkDoubleBet(){
          let arr = [];
          for(let i=0;i<this.game.double;i++) arr.push(i);
          return arr;
      },
  },

};
</script>
<style lang="scss" src="./css/Coins.scss" scoped />