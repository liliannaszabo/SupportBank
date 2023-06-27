const fs = require('fs');
const readline = require('readline');
const filePath = 'Transactions2014.csv'; // Replace with the actual file path
const readStream = fs.createReadStream(filePath);
const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity // To handle both Unix and Windows line endings
});
class Account {
    amount;
    name;
    constructor(name) {
        this.name = name;
    }
    addMoney(amountToBeAdded){
        this.amount += amountToBeAdded
    }
}

class AccountManager{
    accounts = [];
    addAccount(account){
        this.accounts.push(account);
    }

    findAccountByName(name){
        this.accounts.forEach(account =>{
                if(account.name === name){
                    return account;
                }
            }
        )
        return null;
    }

    existsAccount(name){
        this.accounts.forEach(account =>{
                if(account.name === name){
                    return true;
                }
            }
        )
        return false;
    }

}
let accountManager = new AccountManager();
rl.on('line', (line) => {
    var data = line.split(',')
    console.log('Line:', line);
    if(!accountManager.existsAccount(line[1])){
        accountManager.addAccount(new Account(line[1]));
    }

});

rl.on('close', () => {
    console.log('Finished reading the file');
});









