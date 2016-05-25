import fs from 'fs';
import readline from 'readline';
import verEx from 'verbal-expressions';
import csv from 'fast-csv';

const readFileLine = readline.createInterface({
  input: fs.createReadStream('/Users/allanlukwago/apps/budget-data/samples/2014-15.txt')
});

// configuring csv writableStream
const csvStream = csv.createWriteStream({ headers: true });
const writableStream = fs.createWriteStream('my.csv');
csvStream.transform(row => ({
  sector: row[0],
  'Approved Budget': row[1],
  released: row[2],
  spent: row[3],
  '% Budget realsed': row[4],
  '% budget spent': row[5],
  '% releases spent': row[6]
}))
.pipe(writableStream);


const fileLines = [];
let isTable = false;

readFileLine.on('line', (line) => {
  const startMining = verEx().find('Releases and Expenditure by Vote Function');
  const endMining = verEx().find('Excluding Taxes and Arrears');
  const isEnd = endMining.test(line);
  if (isTable) {
    if (line.length > 1 && !isEnd) fileLines.push(line);
    if (isEnd) {
      isTable = false;
      readFileLine.close();
    }
  }
  if (startMining.test(line)) isTable = true;
});

readFileLine.on('close', () => {
  // console.log('first line', fileLines[0]);
  const splicedFileLines = fileLines.splice(3, fileLines.length);
  // console.log(splicedFileLines);
  splicedFileLines.forEach(line => {
    const csvLine = line.split('  ').filter(word => word.length > 1);
    // console.log('line - ', csvLine);
    csvStream.write(csvLine);
  });
  // csvStream.end();
});
