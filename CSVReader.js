

 class CSVReader {
    csv = require('csv-parser')
    fs = require('fs')
    results = [];
    async readCSV(path) {
       await this.fs.createReadStream(path)
            .pipe(this.csv({separator: ','}))
            .on('line', (data) => this.results.push(data))
            .on('end', () => {
                console.log("here")
            });
    }
}

reader = new CSVReader();
data = Promise.resolve(reader.readCSV("Transactions2014.csv"));

 console.log(data);





