import fs from 'fs';
import readline from 'readline';
import verEx from 'verbal-expressions';
import csv from 'fast-csv';
import { budgetSegmentsToRead } from './config';

const rootPath = '/Users/allanlukwago/apps/budget-data/samples';

const readFileByLine = readline.createInterface({
  input: fs.createReadStream(`${rootPath}/2014-15.txt`)
});

const date = new Date();
const csvFileName = date.getTime();
const writableStream = fs.createWriteStream(`${rootPath}/${csvFileName}.csv`);
// configuring csv writableStream
const csvStream = csv.createWriteStream({ headers: true });
// adding a transformation function that is responsible for the row title
csvStream.transform(row => ({
  'Section Name': row[7],
  Sector: row[0],
  'Approved Budget': row[1],
  released: row[2],
  spent: row[3],
  '% Budget realsed': row[4],
  '% budget spent': row[5],
  '% releases spent': row[6]
}))
.pipe(writableStream);

const csvLineTowrite = (line) => line.split('  ').filter(word => word.length > 1);

const writeLineToFile = (line, title) => {
  const csvLine = csvLineTowrite(line);
  // check whether we have numbers after the first item in the array
  const onlyValues = csvLine.slice(2, csvLine.length - 1);
  const isNotValidLine = onlyValues.every(val => isNaN(val));
  // if (title === 'Table V3.2: 2014/15 GoU Expenditure by Item') console.log(csvLine.length);
  if (csvLine.length > 6 && !isNotValidLine) {
    if (csvLine.length !== 7) csvLine.splice(0, 2, `${csvLine[0]} ${csvLine[1]}`);
    csvLine.push(title);
    csvStream.write(csvLine);
  }
};


const isNewTableExpressions =
  (segments) => segments.map(segment => verEx().find(segment.startLine));

function readInFile(segments) {
  let startMining = false;
  let isTableTitle = false;
  let title = null;
  const isTableExpressions = isNewTableExpressions(segments);
  readFileByLine.on('line', (line) => {
    isTableTitle = isTableExpressions.some(expression => expression.test(line));
    if (isTableTitle) {
      title = line;
      startMining = true;
      console.log('currentTable-> ', title);
    }
    if (startMining) writeLineToFile(line, title);
  });
}

const main = (segments) => {
  readInFile(segments);
  readFileByLine.on('close', () => {
    csvStream.end();
    console.log('finished reading files closing');
  });
};

main(budgetSegmentsToRead);
