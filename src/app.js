import fs from 'fs';
import readline from 'readline';
import verEx from 'verbal-expressions';
import csv from 'fast-csv';
import { budgetSegmentsToRead, transformRegular, transformOverview } from './config';
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
  // adding a transformation function that is responsible for the row titles
  const transform = program.overview ? transformOverview : transformRegular;
  stream.transform(transform)
  .pipe(writableStream);
  return stream;
})();

// transform sentences to array and removes empty elements(space)
const csvLineTowrite = (line) => line.split('  ').filter(word => word.length > 1);

// function we use to writing out csv lines for regular tables
// to the csv file
const writeLineToFileRegular = (line, title) => {
  const csvLine = csvLineTowrite(line);
  // check whether we have numbers after the first items in the array
  const onlyValues = csvLine.slice(2, csvLine.length - 1);
  const isNotValidLine = onlyValues.every(val => isNaN(val));
  if (csvLine.length > 6 && !isNotValidLine && !title.includes('Overview of Vote Expenditures')) {
    if (csvLine.length !== 7) csvLine.splice(0, 2, `${csvLine[0]} ${csvLine[1]}`);
    csvLine.push(title);
    csvStream.write(csvLine);
  }
};

// looks bad global variable FIXME
let missingValue = null;
// function we use to writing out csv lines for the overviewVoteExpenditure table
// which is abit different from the rest of the tables
const writeLineToOverView = (line, title) => {
  const csvLine = csvLineTowrite(line);
  // check whether we have numbers after the first items in the array
  const onlyValues = csvLine.slice(2, csvLine.length - 1);
  const isNotValidLine = onlyValues.every(val => isNaN(val));
  // table structure quacks
  if (line.includes('Recurrent')) missingValue = csvLine[1];
  if (line.includes('Non Wage')) csvLine.splice(2, 0, missingValue);
  if (line.includes('and Taxes')) csvLine.splice(0, 2, csvLine[1]);

  if (csvLine.length > 6 && !isNotValidLine && title.includes('Overview of Vote Expenditures')) {
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
  const writetoFile = program.overview ? writeLineToOverView : writeLineToFileRegular;
  const isTableExpressions = isNewTableTitleExpressions(segments);
  readFileByLine.on('line', (line) => {
    isTableTitle = isTableExpressions.some(expression => expression.test(line));
    if (isTableTitle) {
      title = segments.find(segment => line.includes(segment.tableTitle)).tableTitle;
      startMining = true;
      console.log('currentTable: ', title);
    }
    if (startMining) writetoFile(line, title);
  });
}

function main(segments) {
  const minedTextFile = program.args[0].split('.');
  const readFileByLine = readline.createInterface({
    input: fs.createReadStream(`${minedTextFile}.txt`)
  });
  readInFile(segments, readFileByLine);
  readFileByLine.on('close', () => {
    csvStream.end();
    console.log('*finished reading files closing*');
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
