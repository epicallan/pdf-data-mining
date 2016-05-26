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
  const onlyValues = csvLine.slice(2, csvLine.length - 1);
  const isNotValidLine = onlyValues.every(val => isNaN(val));
  // console.log(`shallow copy : ${isNotValidLine}`, onlyValues);
  if (csvLine.length === 7 && !isNotValidLine) csvStream.write(csvLine);
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


function readInFile({ segment, csvStream }) {
  let isTable = false;
  let isTableTitle = false;
  const startMining = verEx().find(segment.startLine);
  const endMiningExpression = verEx().find(segment.endLine);
  const isTableItem = verEx().find(segment.firstItem);
  readFileByLine.on('line', (line) => {
    const isEnd = endMiningExpression.test(line);
    if (isEnd) console.log('finished writing table:', segment.startLine);
    if (!isTableTitle) isTableTitle = startMining.test(line);
    if (!isTable && isTableTitle) isTable = isTableItem.test(line); // start writing in new Table
    if (isTable && !isEnd) writeLineToFile(line, csvStream);
  });
}

const closeCsvStreams = (csvStreams) => csvStreams.forEach(stream => stream.end());

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
