import fs from 'fs';
import readline from 'readline';
import verEx from 'verbal-expressions';
import csv from 'fast-csv';
import { budgetSegmentsToRead } from './config';
const spawn = require('child_process').spawn;

const pdfRootPath = '/Users/allanlukwago/apps/budget-data/samples';

const pdftotext = spawn('pdftotext',
['-layout', '-f', '444', '-l', '447', '2014-15.pdf'], {
  cwd: pdfRootPath,
  env: process.env
});

// returns a file stream, which the csv stream pipes into
const writableStream = (() => {
  const date = new Date();
  const csvFileName = date.getTime();
  const stream = fs.createWriteStream(`${pdfRootPath}/healthB-${csvFileName}.csv`);
  return stream;
})();

// configuring csv stream object which feeds into the file stream
const csvStream = (() => {
  const stream = csv.createWriteStream({ headers: true });
  // adding a transformation function that is responsible for the row title
  stream.transform(row => ({
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
  return stream;
})();

const csvLineTowrite = (line) => line.split('  ').filter(word => word.length > 1);

const writeLineToFile = (line, title) => {
  const csvLine = csvLineTowrite(line);
  // check whether we have numbers after the first items in the array
  const onlyValues = csvLine.slice(2, csvLine.length - 1);
  const isNotValidLine = onlyValues.every(val => isNaN(val));
  if (csvLine.length > 6 && !isNotValidLine) {
    // there should only be 7 items
    if (csvLine.length !== 7) csvLine.splice(0, 2, `${csvLine[0]} ${csvLine[1]}`);
    csvLine.push(title);
    csvStream.write(csvLine);
  }
};


const isNewTableTitleExpressions =
  (segments) => segments.map(segment => verEx().find(segment.tableTitle));

function readInFile(segments, readFileByLine) {
  let startMining = false;
  let isTableTitle = false;
  let title = null;
  const isTableExpressions = isNewTableTitleExpressions(segments);
  readFileByLine.on('line', (line) => {
    isTableTitle = isTableExpressions.some(expression => expression.test(line));
    if (isTableTitle) {
      title = line;
      startMining = true;
      console.log('currentTable: ', title);
    }
    if (startMining) writeLineToFile(line, title);
  });
}

function main(segments) {
  const readFileByLine = readline.createInterface({
    input: fs.createReadStream(`${pdfRootPath}/2014-15.txt`)
  });
  readInFile(segments, readFileByLine);
  readFileByLine.on('close', () => {
    csvStream.end();
    console.log('finished reading files closing');
  });
}

pdftotext.stderr.on('data', (data) => {
  console.log(`stderr : ${data}`);
  process.exit();
});

pdftotext.on('close', (code) => {
  console.log(`child process exited with code  ${code}`);
  setTimeout(main(budgetSegmentsToRead), 3000);
});
