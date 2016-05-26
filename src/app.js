import fs from 'fs';
import readline from 'readline';
import verEx from 'verbal-expressions';
import csv from 'fast-csv';

const rootPath = '/Users/allanlukwago/apps/budget-data/samples';

const readFileByLine = readline.createInterface({
  input: fs.createReadStream(`${rootPath}/2014-15.txt`)
});

const tableSegmentToRead = {
  startLine: 'GoU Releases and Expenditure by Output*',
  endLine: 'QUARTER 4: Highlights of Vote Performance'
};

const tableName = tableSegmentToRead.startLine;
// configuring csv writableStream
const csvStream = csv.createWriteStream({ headers: true });

const writableStream = fs.createWriteStream(`${rootPath}/${tableName}.csv`);

// adding a transformation function that is responsible for the row title
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

const csvLineTowrite = (line) => line.split('  ').filter(word => word.length > 1);

const writeLineToFile = (line) => {
  const csvLine = csvLineTowrite(line);
  if (csvLine.length === 7) csvStream.write(csvLine);
  return csvLine;
};

/* eslint-disable consistent-return */

const isEndOfTable = (endPhrase, line) => {
  if (endPhrase) {
    const endMiningExpression = verEx().find(endPhrase);
    return endMiningExpression.test(line);
  }
  const csvLine = csvLineTowrite(line);
  if (csvLine.length < 3) return true;
};

const readInFile = (segment) => {
  let isTable = false;
  readFileByLine.on('line', (line) => {
    const startMining = verEx().find(segment.startLine);
    const isEnd = isEndOfTable(segment.endLine, line);
    if (isTable) {
      if (line.length > 1 && !isEnd) writeLineToFile(line);
      if (isEnd) {
        isTable = false;
        console.log('we could be done');
      }
    }
    if (startMining.test(line)) isTable = true; // write in new Table
  });
};


readFileByLine.on('close', () => {
  csvStream.end();
});

readInFile(tableSegmentToRead);
