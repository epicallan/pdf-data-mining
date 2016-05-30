import fs from 'fs';
import readline from 'readline';
import verEx from 'verbal-expressions';
import csv from 'fast-csv';
import {
  budgetSegmentsToRead,
  transformRegular,
  transformOverview,
  transformForAnnexTables } from './config';
import program from './cli';

const spawn = require('child_process').spawn;

const pdftoTextProcess = () => (spawn('pdftotext',
['-layout', '-f', program.first, '-l', program.last, program.args[0]]));

// returns a file stream, which the csv stream pipes into
const writableStream = () => {
  const date = new Date();
  const time = date.getTime();
  const csvFileName = program.name || time;
  const stream = fs.createWriteStream(`${csvFileName}.csv`);
  return stream;
};


// configuring csv stream object which feeds into the file stream
const csvStream = () => {
  const writeStream = writableStream();
  const stream = csv.createWriteStream({ headers: true });
  // adding a transformation function that is responsible for the row titles
  let transform = null;
  if (program.annex) {
    transform = transformForAnnexTables;
  } else {
    transform = program.overview ? transformOverview : transformRegular;
  }
  stream.transform(transform)
  .pipe(writeStream);
  return stream;
};

// transform sentences to array and removes empty elements(space) in the array
const csvLineTowrite = (line) => line.split('  ').filter(word => word.length > 1);

// we are only interested in sentence lines that have numerical values
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

const writeLineForAnnexTables = (line, { title, stream }) => {
  const hasNumericalValues = shouldHaveNumericalValues(line);
  if (!hasNumericalValues) return false;
  const csvLine = csvLineTowrite(line);
  if (hasNumericalValues && !title.includes('Annex')) {
    stream.write([title, ...csvLine]);
  }
  return true;
};
// function we use to writing out csv lines for regular tables
// to the csv file
const writeLineToFileRegular = (line, { title, voteTitle, stream }) => {
  const hasNumericalValues = shouldHaveNumericalValues(line);
  if (!hasNumericalValues) return false;
  const csvLine = csvLineTowrite(line);
  // check whether we have numbers after the first items in the array
  if (hasNumericalValues && !title.includes('Overview of Vote Expenditures')) {
    if (csvLine.length !== 7) csvLine.splice(0, 2, `${csvLine[0]} ${csvLine[1]}`);
    stream.write([...csvLine, title, voteTitle]);
  }
  return true;
};

// looks bad global variable FIXME
// the missing value we are looking for is on a previous line
// so we cache it till the line that needs it comes up and we use it
// and we cant do that with in a function that is continuosly being called
let missingValue = null;
// function we use to writing out csv lines for the overviewVoteExpenditure table
// which is abit different from the rest of the tables
const writeLineToOverView = (line, { title, voteTitle, stream }) => {
  const csvLine = csvLineTowrite(line);
  if (line.includes('Recurrent')) missingValue = csvLine[1];
  // check whether we have numbers after the first items in the array
  const hasNumericalValues = shouldHaveNumericalValues(line);
  if (!hasNumericalValues) return false;
  // table structure quacks
  if (line.includes('Non Wage') && missingValue) csvLine.splice(2, 0, missingValue);
  if (line.includes('and Taxes')) csvLine.splice(0, 2, csvLine[1]);
  if (hasNumericalValues && title.includes('Overview of Vote Expenditures')) {
    stream.write([...csvLine, title, voteTitle]);
  }
  return true;
};

const isNewTableTitleExpressions =
  (segments) => segments.map(segment => verEx().find(segment.tableTitle));

export const getVoteTitle = (line, currentVote) => {
  // the line should start with Vote:
  // remove extra white space at the beginning of the line if any
  const newLine = line.replace(/^\s+/, '');
  const hasVoteHasFirstLine = /^Vote:/.test(newLine);
  if (!hasVoteHasFirstLine) return currentVote;
  // should have the vote Number
  const chunkedLine = newLine.replace(/\s{2,}/, ' ').split(' ');
  // test whether 2nd element is a number and third a string
  const isNumber = Number.isInteger(parseInt(chunkedLine[1], 10));
  if (!isNumber) return currentVote;
  if (isNumber && typeof chunkedLine[2] === 'string') {
    const voteTitle = newLine.replace(/(Vote:)(.*[0-9])(.\s)/, '');
    // console.log('line:', line); ;
    return voteTitle.replace(/^\s+/, '');
  }
  return currentVote;
};

function writeCSVFile(segments, readFileByLine, stream) {
  let startMining = false;
  let isTableTitle = false;
  let title = null;
  let voteTitle = null;
  let writeCsvLine = null;
  if (program.annex) {
    writeCsvLine = writeLineForAnnexTables;
  } else {
    writeCsvLine = program.overview ? writeLineToOverView : writeLineToFileRegular;
  }
  const isTableExpressions = isNewTableTitleExpressions(segments);
  readFileByLine.on('line', (line) => {
    console.log(line.includes('Annex'));
    isTableTitle = isTableExpressions.some(expression => expression.test(line));
    voteTitle = getVoteTitle(line, voteTitle);
    if (isTableTitle) {
      title = segments.find(segment => line.includes(segment.tableTitle)).tableTitle;
      startMining = true;
      console.log('Title', voteTitle);
    }
    if (startMining && voteTitle) writeCsvLine(line, { title, voteTitle, stream });
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

if (program.args.length && process.env.NODE_ENV !== 'test') main();
