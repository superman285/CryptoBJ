"use strict";

const {isNull, isUndefined, isNullOrUndef} = require('./helpers');

var cardName = exports.cardName = function cardName(number) {
  if (isNullOrUndef(number)) {
    throw Error('Invalid number');
  }
  switch (number) {
    case 1:
      {
        return 'A';
      }
    case 11:
      {
        return 'J';
      }
    case 12:
      {
        return 'Q';
      }
    case 13:
      {
        return 'K';
      }
    default:
      {
        return number.toString();
      }
  }
};

var suiteName = exports.suiteName = function suiteName(suite) {
  switch (suite.toLowerCase()) {
    case '♥':
    case 'h':
    case 'heart':
    case 'hearts':
      {
        return 'hearts';
      }
    case '♦':
    case 'd':
    case 'diamond':
    case 'diamonds':
      {
        return 'diamonds';
      }
    case '♣':
    case 'c':
    case 'club':
    case 'clubs':
      {
        return 'clubs';
      }
    case '♠':
    case 's':
    case 'spade':
    case 'spades':
      {
        return 'spades';
      }
    default:
      {
        throw Error('invalid suite');
      }
  }
};

var suiteColor = exports.suiteColor = function suiteColor(suite) {
  switch (suite) {
    case 'hearts':
      return 'R';
    case 'diamonds':
      return 'R';
    case 'clubs':
      return 'B';
    case 'spades':
      return 'B';
    default:
      throw Error('invalid suite');
  }
};

var cardValue = exports.cardValue = function cardValue(number) {
  return number < 10 ? number : 10;
};

var makeCard = exports.makeCard = function makeCard(number, suite) {
  var _suite = suiteName(suite);
  return {
    text: cardName(number),
    suite: _suite,
    value: cardValue(number),
    color: suiteColor(_suite)
  };
};

var newDecks = exports.newDecks = function newDecks(n) {
  var cards = [];
  for (var i = 0; i < n; i++) {
    cards = newDeck().concat(cards);
  }
  return cards;
};

var newDeck = exports.newDeck = function newDeck() {
  return [].concat.apply([], ['hearts', 'diamonds', 'clubs', 'spades'].map(function (suite) {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(function (number) {
      return makeCard(number, suite);
    });
  }));
};

var getRandom = exports.getRandom = function getRandom(v) {
  return Math.floor(Math.random() * v);
};

var shuffle = exports.shuffle = function shuffle(original) {
  var array = original.slice(0);
  var currentIndex = array.length;
  var temporaryValue = void 0;
  var randomIndex = void 0;
  while (currentIndex !== 0) {
    randomIndex = getRandom(currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
};

var serializeCard = exports.serializeCard = function serializeCard(value) {
  var digits = value.match(/\d/g);
  var EMPTY = '';
  var number = 0;
  var figure = void 0;
  var suite = EMPTY;
  if (digits && digits.length > 0) {
    number = Number(digits.join(''));
    suite = value.replace(number.toString(), '');
  } else {
    ['j', 'q', 'k'].forEach(function (x, i) {
      if (value.indexOf(x) >= 0 || value.indexOf(x.toUpperCase()) >= 0) {
        number = 11 + i;
        figure = x;
        suite = value.replace(figure, EMPTY).replace(figure.toUpperCase(), EMPTY);
      }
    });
  }
  if (number === 0) {
    throw Error('');
  }
  suite = suite.replace('-', EMPTY);
  return makeCard(number, suite);
};

var serializeCards = exports.serializeCards = function serializeCards(value) {
  if (value === '') {
    throw Error('value should contains a valid raw card/s definition');
  }
  return value.trim().split(' ').map(serializeCard);
};


module.exports = exports;
