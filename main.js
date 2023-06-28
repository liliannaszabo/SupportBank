const csv = require('csv-parser')
const fs = require('fs')

const prompt = require('prompt-sync')();

class Account {
    amount;
    holder;
    constructor(name) {
        this.holder = name;
        this.amount = 0;
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
        let accountResult = null;
        this.accounts.forEach(account =>{
                if(account.holder === name){
                    accountResult = account;
                }
            }
        )
        return accountResult;
    }

    existsAccount(name){
        let exists = false
        this.accounts.forEach(account =>{
                if(account.holder === name){
                    exists = true;
                }
            }
        )
        return exists;
    }

}

class TransactionManager{
    transactions = [];

    addTransaction(transaction){
        this.transactions.push(transaction);
    }

    getTransactionByName(name){
        let result = [];
        this.transactions.forEach(transaction =>{
                if (transaction.to === name || transaction.from === name){
                    result.push(transaction)
                }
            }

        )
        return result;
    }
}

class Transaction{
    amount;
    date;
    from;
    to;
    narrative;

    constructor(date, from, to, narrative, amount) {
        this.date = date;
        this.from = from;
        this.to = to;
        this.narrative = narrative;
        this.amount = amount;
    }

}

let results = [];
function processAccounts(results) {
    let accountManager = new AccountManager();
    results.forEach(transaction =>{
        let fromName = transaction["From"];
        let toName = transaction["To"];
        let fromAccount;
        let toAccount;
        //Create accounts
        if(!accountManager.existsAccount(fromName)){
            fromAccount = new Account(fromName);
            accountManager.addAccount(fromAccount)
        } else{
            fromAccount = accountManager.findAccountByName(fromName);
        }
        if(!accountManager.existsAccount(toName)){
            toAccount = new Account(toName);
            accountManager.addAccount(toAccount)
        } else{
            toAccount = accountManager.findAccountByName(toName);

        }
        let money = parseFloat(transaction["Amount"])
        fromAccount.addMoney(money * -1)


        toAccount.addMoney(money)

    })

    return accountManager;

}
function processTransactions(results) {
    let transactionManager = new TransactionManager();
    results.forEach(line =>{
        let transaction = new Transaction(line["Date"], line["From"], line["To"], line["Narrative"], parseFloat(line["Amount"]))
        transactionManager.addTransaction(transaction)
    })
    return transactionManager;

}


function getUserInput() {
    let userInput = "";
    userInput = prompt("Please enter \'List All\' or \'List[Account_name]\' ");
    return userInput;
}

function logAllAccounts(accountManager) {
    accountManager.accounts.forEach(account => {
            console.log("Account name: " + account.holder + "\n"
                + "Account balance: " + account.amount + "\n"
                + "---------------------------------------------")
        }
    )
}

function logAllTransactions(name, transactionManager) {
    let results = [];
    transactionManager.transactions.forEach(transaction => {
        if(transaction.to === name || transaction.from === name){
            results.push(transaction);
        }
    })
    if(results.length === 0){
        console.log("No transactions for that name");
    }
    else {
        results.forEach(transaction => {
            console.log(
                "Transaction date: " + transaction.date + "\n" +
                "From: " + transaction.from + "\n" +
                "To: " + transaction.to + "\n" +
                "Narrative: " + transaction.narrative + "\n" +
                "Amount " + transaction.amount + "\n"
            )
        })
    }
}

fs.createReadStream('Transactions2014.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
        let accountManager = processAccounts(results)
        let transactionManager = processTransactions(results)

        let goodUserInput = true;
        do {
            let userInput = getUserInput();
            if (userInput === "List All") {
                logAllAccounts(accountManager);
            } else if (userInput.substring(0, 4) === "List") {
                let userInputName = userInput.split("[")[1];
                let actualName = userInputName.substring(0, userInputName.length - 1);
                if(accountManager.existsAccount(actualName))                {
                    logAllTransactions(actualName, transactionManager);
                }
                else{
                    console.log("No account under that name found")
                    goodUserInput = false;
                }
            } else goodUserInput = false;
        } while (goodUserInput === false)
    });







