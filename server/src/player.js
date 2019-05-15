let Player = class Player{

    constructor(){

        this.name = "Player";
        this.balance = new Balance();

        // TODO - temp, give player some amount to play with
        this.balance.add(50000);
    }

}

let Balance = class Balance{
    constructor(){
        this.balance = 0; // TODO get default value from DB or whatever
    }
    set(amount){
        this.balance = this.integer(amount);
    }
    get(){
        return this.balance;
    }
    add(amount){
        this.balance += this.integer(amount);
    }
    sub(amount){
        this.balance -= Math.abs(this.integer(amount));
    }
    compare(amount){
        return this.balance >= this.integer(amount);
    }
    integer(amount){
        return parseInt(amount);
    }
}

module.exports = Player;