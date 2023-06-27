const fs = require("fs");
const csv = require("@fast-csv/parse");

function readCsv(path, options, rowProcessor) {
    return new Promise((resolve, reject) => {
        const data = [];

        csv
            .parseFile(path, options)
            .on("error", reject)
            .on("data", (row) => {
                const obj = rowProcessor(row);
                if (obj) data.push(obj);
            })
            .on("end", () => {
                resolve(data);
            });
    });
}

async function doThings() {
    const data = await readCsv(
        "Transactions2014.csv",
        {},
        (row) => ({ item_id: row[2], qty: row[20] }),
    );
    // use data in API...
}