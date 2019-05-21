<template xmlns:v-bind="http://www.w3.org/1999/xhtml">
  <transition-group
          v-bind:name="transitionName"
          tag="div"
          v-on:enter="onCardEnter"
          v-on:leave="onCardLeave"
  >

    <div v-for="(card,index) in cards"
         class="playing_card_wrapper anim_state"
         :class="`state_${card.anim} card_${side}_${index}`"
         v-show="card.anim === 1 || card.anim === 2"
         v-bind:data-side="side"
         v-bind:data-index="index"
         :key="`card_${side}_${index}`"
    >
      <div class="playing_card">
        <div class="front"><img :src="getCardBack()" /></div>
        <div class="back"><img :src="getCardFront(card)" /></div>
      </div>
    </div>

  </transition-group>
</template>

<script>
import * as constants from "../../constants";
import { TimelineLite } from 'gsap';

export default {
  name: "Cards",
  props: {
    cards: {
      type: Array,
      required: true,
    },
    side: {
      type: String,
        required: true,
    },
    state: {
        type: Object,
        required: true,
    },

    // debug
    animation:{
      type: Array,
    },

  },
  data(){
    return {
        positions: {},
        resizeTimeout: null,
        transitionName: "reveal-card",
    }
  },

  mounted (){

//      this.$root.$on('flipDealerCard', (data)=>{ // this doesnt work with v-show because card already visible, but not flipped to front
//          this.manuallyFlipDealerCard(data.index, data.delay);
//      })


      this.$root.$on('updatePositions', ()=>{
          this.getElementsPositions();
      })

      this.$root.$on('beforeRestart', ()=>{
          this.transitionName = 'leave-card';
      })

      this.$nextTick(() => {
          window.addEventListener('resize', this.handleResize)
          this.handleResize();
      })

  },
  beforeDestroy() {
      window.removeEventListener('resize', this.handleResize)
  },
  methods:{

      handleResize() {

          clearTimeout(this.resizeTimeout);
          this.resizeTimeout = setTimeout(this.getElementsPositions,100)

      },

      getElementsPositions(){

          // get position of cards' deck
          let deck = document.getElementsByClassName('blackjack__table--filldeck')[0];
          if(deck !== undefined) this.positions.deck =  deck.getBoundingClientRect();

          let cardsRight = document.getElementsByClassName('playercards-hand-right')[0];
          if(cardsRight !== undefined) this.positions.right = cardsRight.getBoundingClientRect();

          let cardsLeft = document.getElementsByClassName('playercards-hand-left')[0];
          if(cardsLeft !== undefined) this.positions.left = cardsLeft.getBoundingClientRect();

          let cardsDealer = document.getElementsByClassName('blackjack__table--dealercards')[0];
          if(cardsDealer !== undefined) this.positions.dealer = cardsDealer.getBoundingClientRect();

          let throwAway = document.getElementsByClassName('blackjack__table--emptydeck')[0];
          if(throwAway !== undefined) this.positions.away = throwAway.getBoundingClientRect();

          return true;
      },
      getCardBack(){
          return require("@/assets/cards/back.png");
      },
      getCardFront(card){
          if(card.suite === 'hidden') return "";
          return require("@/assets/cards/"+card.suite+"/"+card.text+""+card.suite+".png");
      },

      onCardEnter(el){

          if(this.side === 'dealer'){
              return this.onDealerCardEnter(el);
          }
          return this.onPlayerCardEnter(el);
      },


      onCardLeave(el){

          if(this.state.stage !== 'done' ) return;
          if(this.transitionName !== 'leave-card') return;

          if(this.side === 'dealer'){
              return this.onDealerCardLeave(el);
          }
          return this.onPlayerCardLeave(el);

      },

      onPlayerCardEnter(el){
          let side = 'right';
          if(el.dataset.side !== undefined && el.dataset.side === 'left') side = 'left';
          const animationSpeed = constants.CARD_REVEAL_ANIMATION_SPEED;
          const animationOpacitySpeed = animationSpeed / 2;
          if(this.positions.deck === undefined || this.positions[side] === undefined){
              let wait = (this.getElementsPositions());
          }
          const deckPosition = this.positions.deck;
          const cardPosition = this.positions[side];
          let x = parseInt(Math.abs(deckPosition.left - cardPosition.left - deckPosition.width));
          let y = parseInt(Math.abs(deckPosition.top -  cardPosition.top + deckPosition.height/2));

          const timeline = new TimelineLite();
          // set starting animation point
          timeline.set(el, {
              opacity: 0,
              rotation: -40,
              x: x,
              y: -y,
              scale: 0.6
          })

          // opacity and start flipping card when card is fully visible
          timeline.to(el, animationOpacitySpeed, {
              opacity: 1,
//              onComplete(){
//                  el.classList.add('revealed');
//              }
          },0);

          // transition card from deck position to card's default position
          timeline.to(el, animationSpeed, {
              rotation: 0,
              x: 0,
              y: 0,
              scale: 1
          },0);

          timeline.play();

      },

      onDealerCardEnter(el){

          const cardIndex = el.dataset.index;
          const cardHidden = this.cards[cardIndex].text === 'hidden';

          const animationSpeed = constants.CARD_REVEAL_ANIMATION_SPEED;
          const animationOpacitySpeed = animationSpeed / 2;

          const deckPosition = this.positions.deck;
          const cardPosition = this.positions.dealer;

          let x = parseInt(Math.abs(deckPosition.left - cardPosition.left - deckPosition.width));
          let y = parseInt(Math.abs(deckPosition.top -  cardPosition.top ));

          const timeline = new TimelineLite();

          // set starting animation point
          timeline.set(el, {
              // opacity: 0,
              rotation: -40,
              x: x,
              y: y,
              scale: 0.6
          })

          // opacity and start flipping card when card is fully visible
          timeline.to(el, animationOpacitySpeed, {
              opacity: 1,
//              onComplete(){
//                  if(!cardHidden) el.classList.add('revealed');
//              }
          },0);

          // transition card from deck position to card's default position
          timeline.to(el, animationSpeed, {
              rotation: 0,
              x: 0,
              y: 0,
              scale: 1,
          }, 0);

          timeline.play();

      },

      onPlayerCardLeave(el){

          let side = 'right';
          if(typeof el.dataset.side !== 'undefined' && el.dataset.side === 'left') side = 'left';

          const targetPosition = this.positions.away;
          const cardPosition = this.positions[side];

          this.cardLeaveAnimation(el, cardPosition, targetPosition);

      },

      onDealerCardLeave(el){

          const targetPosition = this.positions.away;
          const cardPosition = this.positions.dealer;

          this.cardLeaveAnimation(el, cardPosition, targetPosition);

      },

      cardLeaveAnimation(el, cardPosition, targetPosition){

          const animationSpeed = constants.CARD_LEAVE_ANIMATION_SPEED;
          const animationOpacitySpeed = animationSpeed / 2;
          const flipAnimationDelay = constants.CARD_FLIP_ANIMATION_SPEED * 0.75; // dont wait for full flip to finish

          let x = parseInt(targetPosition.left - cardPosition.left - (targetPosition.width * 0.1));
          let y = parseInt(targetPosition.top -  cardPosition.top + (targetPosition.height * 0.1));

          const timeline = new TimelineLite();

          timeline.to(el, animationSpeed, {
              x: x,
              y: y,
              scale: 0.8,
          }, flipAnimationDelay);

          timeline.to(el, animationOpacitySpeed, {
              opacity: 0,
          }, flipAnimationDelay + animationOpacitySpeed);

//          el.classList.remove('revealed');
          timeline.play();

      },

//      manuallyFlipDealerCard(_index, _delay){
//
//          let el = document.getElementsByClassName('card_dealer_'+_index)[0];
//          if(el !== undefined){
//              setTimeout(()=>{
//                  el.classList.add('revealed');
//              }, _delay)
//          }else{
//              console.log('FAILED TO REVEAL DEALER CARD #'+_index, el);
//          }
//
//      },

  }
};
</script>
<style lang="scss" src="./css/Cards.scss" />
