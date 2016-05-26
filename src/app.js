import fs from 'fs';
import readline from 'readline';
import verEx from 'verbal-expressions';
import csv from 'fast-csv';
import { budgetSegmentsToRead } from './config';

const rootPath = '/Users/allanlukwago/apps/budget-data/samples';

const readFileByLine = readline.createInterface({
  input: fs.createReadStream(`${rootPath}/2014-15.txt`)
});

const csvLineTowrite = (line) => line.split('  ').filter(word => word.length > 1);

const writeLineToFile = (line, csvStream) => {
  const csvLine = csvLineTowrite(line);
  // check whether we have numbers after the first item in the array
  const onlyValues = csvLine.slice(0, csvLine.length - 1);
  const isValidLine = onlyValues.every(val => !isNaN(val));
  if (csvLine.length === 7 && isValidLine) csvStream.write(csvLine);
};

const csvStreamsAndSegments = (budgetSegments) =>
  budgetSegments.map(segment => {
    const tableName = segment.startLine;
    const writableStream = fs.createWriteStream(`${rootPath}/${tableName}.csv`);
    // configuring csv writableStream
    const csvStream = csv.createWriteStream({ headers: true });
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
    return { segment, csvStream };
  });


const readInFile = ({ segment, csvStream }) => {
  let isTable = false;
  const startMining = verEx().find(segment.startLine);
  const endMiningExpression = verEx().find(segment.endLine);
  readFileByLine.on('line', (line) => {
    // if (isEnd) csvStream.end();
    const isEnd = endMiningExpression.test(line);
    if (isTable && !isEnd) writeLineToFile(line, csvStream);
    if (startMining.test(line)) isTable = true; // write in new Table
  });
};

const closeCsvStreams = (csvStreams) => csvStreams.forEach(stream => stream.close);

const main = (csvWriteStreamsAndSegments) => {
  const csvStreams = [];
  csvWriteStreamsAndSegments.forEach(obj => {
    csvStreams.push(obj.csvStream);
    readInFile(obj);
  });
  readFileByLine.on('close', () => {
    closeCsvStreams(csvStreams);
    console.log('finished reading files closing');
  });
};

main(csvStreamsAndSegments(budgetSegmentsToRead));
