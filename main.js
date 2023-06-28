const csv = require('csv-parser')
const fs = require('fs')
const moment = require("moment");
const log4js = require("log4js");
const prompt = require('prompt-sync')();
const logger = log4js.getLogger('logs');
const jsonFile = require('./Transactions2013.json');


log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
})

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

class Transaction{
    amount;
    date;
    from;
    to;
    narrative;

    constructor(date, from, to, narrative, amount) {
        this.date = moment(date, "DD-MM-YYYY");
        if(!this.date.isValid()){
            logger.error("Invalid date: " + date);
        }
        this.from = from;
        this.to = to;
        this.narrative = narrative;
        this.amount = parseFloat(amount);
        if(isNaN(this.amount)){
            logger.error("Invalid amount: " + amount);
        }
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

function processAccounts(transactionManager) {
    let accountManager = new AccountManager();

    transactionManager.transactions.forEach(transaction =>{
        let fromName = transaction.from;
        let toName = transaction.to;
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

        let money = parseFloat(transaction.amount)
        fromAccount.addMoney(money * -1 * 100)

        toAccount.addMoney(money * 100)
    })

    return accountManager;

}

let results = [];
function processTransactionsCSV(results) {
    let transactionManager = new TransactionManager();
    results.forEach(line =>{
        let transaction = new Transaction(line["Date"], line["From"], line["To"], line["Narrative"], (line["Amount"]))
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
                + "Account balance: " + account.amount / 100 + "\n"
                + "---------------------------------------------")
        }
    )
}

function handleUserInteraction(accountManager, transactionManager) {
    let goodUserInput = true;
    do {
        let userInput = getUserInput();
        if (userInput === "List All") {
            logAllAccounts(accountManager);
        } else if (userInput.substring(0, 4) === "List") {
            if (!userInput.includes("[")) {
                goodUserInput = false;
            } else {
                let userInputName = userInput.split("[")[1];
                let actualName = userInputName.substring(0, userInputName.length - 1);
                if (accountManager.existsAccount(actualName)) {
                    logAllTransactions(actualName, transactionManager);
                } else {
                    console.log("No account under that name found")
                    goodUserInput = false;
                }
            }
        } else goodUserInput = false;
    } while (goodUserInput === false)
}

function handleCSVInput(results) {
    let transactionManager = processTransactionsCSV(results)
    let accountManager = processAccounts(transactionManager)

    handleUserInteraction(accountManager, transactionManager);
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
                "Transaction date: " + (transaction.date.format('DD/MM/YYYY')) + "\n" +
                "From: " + transaction.from + "\n" +
                "To: " + transaction.to + "\n" +
                "Narrative: " + transaction.narrative + "\n" +
                "Amount " + transaction.amount + "\n"
            )
        })
    }
}


function readCSV(path) {
    fs.createReadStream(path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            handleCSVInput(results);
        });
}

function processTransactionsJSON(results) {
    let transactionManager = new TransactionManager();
    results.forEach(line =>{
        let transaction = new Transaction(line["Date"], line["FromAccount"], line["ToAccount"], line["Narrative"], (line["Amount"]))
        transactionManager.addTransaction(transaction)
    })
    return transactionManager;
}

function handleJSONInput(jsonFile) {
    let transactionManager = processTransactionsJSON(jsonFile);

    let accountManager = processAccounts(transactionManager)

    handleUserInteraction(accountManager, transactionManager);


}

function readJSON(path) {
    const jsonFile = require("./" + path);
    handleJSONInput(jsonFile)
}

function main() {
    logger.log("starting program")
    let path = 'Transactions2013.json'
    let type = path.split('.')[1];
    switch (type) {
        case "csv":
            readCSV(path)
            break;
        case "json":
            readJSON(path)
            break;
        default:
            console.log("Filetype not supported")
    }
}

main();








