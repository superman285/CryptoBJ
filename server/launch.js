const app = require("express")();
const http = require("http").Server(app);

const io = require("socket.io")(http);
// io.origins('*:*');

const __ = require("./src/constants");
const ERROR = require("./src/errors");
const Blackjack = require("./src/blackjack/blackjackGame");
const Player = require("./src/player"); // you can store player data here, like balance, name, etc..
const sessions = {};
const rules = require("./src/blackjack/blackjackRules");

io.on("connection", function(socket) {
    // console.log('user connected: '+socket.id);

    let player = new Player(); // TODO - player should have real balaance checked in this class
    let game = new Blackjack(null, player);
    let restoreState = null;

    let savePlayerState = gameState => {
        if (gameState === undefined) gameState = game.getState();
        sessions[socket.id] = gameState;
    };

    // this is how you restore a session if needed.
    // in case you have  a logged user and associate its user_login with socket.id
    if (sessions[socket.id] !== undefined) {
        restoreState = sessions[socket.id];
    } else {
        restoreState = game.startFreshGame();
        savePlayerState(restoreState); // make sure user doesnt cheat, by savign his session each time after a change
    }

    // INIT
    (() => {
        // on init, send default game state to initialize things
        socket.emit("init", {
            state: restoreState,
            balance: player.balance.get(),
            rules: rules.frontRules
        });
    })();

    // ON player bet
    socket.on("bet", req => {
        let amount = parseInt(req.amount);
        let allowedOrError = game.playerActionsAllowed(undefined, amount);
        if (allowedOrError !== true) return onFailure(allowedOrError);

        game.bet(amount);
        game.handle({ action: "deal" }, onActionSuccess, onFailure);

        savePlayerState();
    });

    // on Player action
    socket.on("action", req => {
        let allowedOrError = game.playerActionsAllowed(
            req.payload.action,
            undefined
        );
        if (allowedOrError !== true) return onFailure(allowedOrError);

        game.handle(req.payload, onActionSuccess, onFailure);

        savePlayerState();
    });

    // restart game after it is finished
    socket.on("restart", req => {
        // check if game really ended
        if (!game.isOver()) return onFailure(ERROR.GAME_NOT_ENDED);

        restoreState = game.startFreshGame();
        savePlayerState();

        socket.emit("init", {
            state: restoreState,
            balance: player.balance.get()
        });
    });

    // if player disconnected
    socket.on("disconnect", function() {
        // console.log('user disconnected', socket.id);
    });

    // return success
    let onActionSuccess = data => {
        // TEST - TEMP TIMEOUT ON EVERYTHING, to simulate server being not on localhost
        // setTimeout(()=>{
        socket.emit("action", data);
        // }, 250);
    };

    // return failure
    let onFailure = err => {
        console.log("onFailure", err);
        // TODO - throws critical error if server restarts but player already has played
        socket.emit("game-error", {
            message: err
        });
    };

    // TODO - disable this on live because it enables cheating (for debugging purposes)
    socket.on("cheats", req => {
        let cheatCode = req.cheatCode || undefined;

        console.log("cheats", cheatCode);

        if (cheatCode === "debug_state") {
            let rawState = game.getRawState();
            console.log("------------------------------------------------");
            console.log(rawState);
            socket.emit("debug", rawState);
        } else if (cheatCode === "balance_5") {
            game.player.balance.set(50000);
            socket.emit("update", { balance: game.player.balance.get() });
        } else if (cheatCode === "balance_1") {
            game.player.balance.set(1000);
            socket.emit("update", { balance: game.player.balance.get() });
        } else {
            game.cheese(cheatCode, data => {
                socket.emit("cheats", data);
            });
        }
    });
});

http.listen(__.SOCKETS_PORT, function() {
    // HINT: for sockets to work properly, make sure port is open in server's firewall
    console.log("Server launched & listening on port *:" + __.SOCKETS_PORT);
});
