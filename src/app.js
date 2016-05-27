import fs from 'fs';
import readline from 'readline';
import verEx from 'verbal-expressions';
import csv from 'fast-csv';
import { budgetSegmentsToRead } from './config';
import program from './cli';

const spawn = require('child_process').spawn;

const pdftoTextProcess = spawn('pdftotext',
['-layout', '-f', program.first, '-l', program.last, program.args[0]]);

// returns a file stream, which the csv stream pipes into
const writableStream = (() => {
  const date = new Date();
  const time = date.getTime();
  const csvFileName = `${program.name}-${time}` || time;
  const stream = fs.createWriteStream(`${csvFileName}.csv`);
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
      title = segments.find(segment => line.includes(segment.tableTitle)).tableTitle;
      startMining = true;
      console.log('currentTable: ', title);
    }
    if (startMining) writeLineToFile(line, title);
  });
}

function main(segments) {
  const readFileByLine = readline.createInterface({
    input: fs.createReadStream('2014-15.txt')
  });
  readInFile(segments, readFileByLine);
  readFileByLine.on('close', () => {
    csvStream.end();
    console.log('*finished reading files closing*');
    process.exit();
  });
}

pdftoTextProcess.stderr.on('data', (data) => {
  console.log(`stderr : ${data}`);
  process.exit();
});

pdftoTextProcess.on('close', (code) => {
  console.log(`child process exited with code  ${code}`);
  setTimeout(main(budgetSegmentsToRead), 3000);
});
