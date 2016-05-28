import fs from 'fs';
import readline from 'readline';
import verEx from 'verbal-expressions';
import csv from 'fast-csv';
import { budgetSegmentsToRead, transformRegular, transformOverview } from './config';
import program from './cli';

const spawn = require('child_process').spawn;

const pdftoTextProcess = () => (spawn('pdftotext',
['-layout', '-f', program.first, '-l', program.last, program.args[0]]));

// returns a file stream, which the csv stream pipes into
const writableStream = () => {
  const date = new Date();
  const time = date.getTime();
  const csvFileName = `${program.name}-${time}` || time;
  const stream = fs.createWriteStream(`${csvFileName}.csv`);
  return stream;
};


// configuring csv stream object which feeds into the file stream
const csvStream = () => {
  const writeStream = writableStream();
  const stream = csv.createWriteStream({ headers: true });
  // adding a transformation function that is responsible for the row titles
  const transform = program.overview ? transformOverview : transformRegular;
  stream.transform(transform)
  .pipe(writeStream);
  return stream;
};

// transform sentences to array and removes empty elements(space)
const csvLineTowrite = (line) => line.split('  ').filter(word => word.length > 1);

export const shouldHaveNumericalValues = (line) => {
  const chunkedLine = csvLineTowrite(line);
  if (chunkedLine.length < 7) return false;
  const lastValues = chunkedLine.slice(2, chunkedLine.length);
  const values = lastValues.map(val => {
    let value = val;
    if (val.includes('N/A')) value = 0;
    return parseInt(value, 10);
  });
  const isLineValid = values.every(val => Number.isInteger(val));
  return isLineValid;
};
// function we use to writing out csv lines for regular tables
// to the csv file
export const writeLineToFileRegular = (line, { title, voteTitle, stream }) => {
  const csvLine = csvLineTowrite(line);
  const hasNumericalValues = shouldHaveNumericalValues(line);
  if (!hasNumericalValues) return false;
  // check whether we have numbers after the first items in the array
  if (hasNumericalValues && !title.includes('Overview of Vote Expenditures')) {
    if (csvLine.length !== 7) csvLine.splice(0, 2, `${csvLine[0]} ${csvLine[1]}`);
    stream.write([...csvLine, voteTitle, title]);
  }
  return true;
};

// looks bad global variable FIXME
// the missing value we are looking for is on a previous line
// so we cache is here till the line that needs it comes up and we use it
let missingValue = null;
// function we use to writing out csv lines for the overviewVoteExpenditure table
// which is abit different from the rest of the tables
const writeLineToOverView = (line, { title, voteTitle, stream }) => {
  const csvLine = csvLineTowrite(line);
  // check whether we have numbers after the first items in the array
  const hasNumericalValues = shouldHaveNumericalValues(line);
  if (!hasNumericalValues) return false;
  // table structure quacks
  if (line.includes('Recurrent')) missingValue = csvLine[1];
  if (line.includes('Non Wage')) csvLine.splice(2, 0, missingValue);
  if (line.includes('and Taxes')) csvLine.splice(0, 2, csvLine[1]);
  if (hasNumericalValues && title.includes('Overview of Vote Expenditures')) {
    stream.write([...csvLine, voteTitle, title]);
  }
  return true;
};

const isNewTableTitleExpressions =
  (segments) => segments.map(segment => verEx().find(segment.tableTitle));

export const getVoteTitle = (line, currentVote) => {
  // the line should start with Vote:
  const hasVoteHasFirstLine = /^Vote:/.test(line);
  if (!hasVoteHasFirstLine) return currentVote;
  // only returns vote titles
  const chunkedLine = csvLineTowrite(line);
  // should have a count of 3
  if (chunkedLine.length !== 2) return currentVote;
  // test whether first item is Vote: and  2nd is a number and third a string
  const voteNumber = chunkedLine[0].split(' ')[1];
  const isNumber = Number.isInteger(parseInt(voteNumber, 10));
  if (!isNumber) return currentVote;
  if (isNumber && typeof chunkedLine[1] === 'string') return chunkedLine[1].replace(/^\s/, '');
  return currentVote;
};

function writeCSVFile(segments, readFileByLine, stream) {
  let startMining = false;
  let isTableTitle = false;
  let title = null;
  let currentVoteTitle = null;
  const writeCSVLine = program.overview ? writeLineToOverView : writeLineToFileRegular;
  const isTableExpressions = isNewTableTitleExpressions(segments);
  readFileByLine.on('line', (line) => {
    isTableTitle = isTableExpressions.some(expression => expression.test(line));
    currentVoteTitle = getVoteTitle(line, currentVoteTitle);
    if (isTableTitle) {
      title = segments.find(segment => line.includes(segment.tableTitle)).tableTitle;
      startMining = true;
      console.log('currentTable: ', `${currentVoteTitle}: ${title}`);
    }
    if (startMining && currentVoteTitle) writeCSVLine(line, { title, currentVoteTitle, stream });
  });
}

const readByLine = () => {
  const minedTextFile = program.args[0].split('.');
  return readline.createInterface({
    input: fs.createReadStream(`${minedTextFile[0]}.txt`)
  });
};

const closeReadingTextFile = (readFileByLine, stream) => {
  readFileByLine.on('close', () => {
    stream.end();
    console.log('*finished reading files closing*');
    setTimeout(() => process.exit, 2000); // exit process
  });
};

function main() {
  const pdfMining = pdftoTextProcess();
  const csvWriteStream = csvStream();

  pdfMining.stderr.on('data', (data) => {
    console.log(`stderr : ${data}`);
    process.exit();
  });

  pdfMining.on('close', (code) => {
    console.log(`child process for PDFtoText exited with code  ${code}`);
    setTimeout(() => {
      const readFileByLine = readByLine();
      writeCSVFile(budgetSegmentsToRead, readFileByLine, csvWriteStream);
      closeReadingTextFile(readFileByLine, csvWriteStream);
    }, 2000);
  });
}
export default main;
