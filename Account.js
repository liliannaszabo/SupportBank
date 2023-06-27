
export class Account {
    amount;
    name;
    constructor(name) {
        this.name = name;
    }
    addMoney(amountToBeAdded){
        this.amount += amountToBeAdded
    }
}
