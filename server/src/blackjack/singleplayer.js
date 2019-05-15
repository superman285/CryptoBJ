exports.Game = exports.actions = exports.presets = exports.engine = exports.constants = undefined;

var constants = exports.constants = require('./../constants');
var engine = exports.engine  = require('./engine/engine');
var presets = exports.presets  = require('./engine/rules');
var actions = exports.actions = require('./engine/actions');

var _game2 = require('./engine/Game');
exports.Game = _game2.default;

module.exports = exports;