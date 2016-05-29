import fs from 'fs';
import readline from 'readline';

// const spawn = require('child_process').spawn;

const rootPath = '/Users/allanlukwago/apps/budget-data/samples';

// returns a file stream, which the csv stream pipes into
const writableStream = () => {
  const stream = fs.createWriteStream((`${rootPath}/merged.csv`));
  return stream;
};

const readStream = (fileName) => (
  readline.createInterface({
    input: fs.createReadStream(`${rootPath}/${fileName}`)
  }));

const tableHeading = (line) =>
  (/(^\bVote Name\b)(.*\bTable Name\b)/.test(line));


function mergeFiles(files, writerStream, reader) {
  let isTableHeadingLine = false;
  const writer = writerStream();
  files.forEach((fileName, index) => {
    const stream = reader(fileName);
    stream.on('line', (line) => {
      // we want to record the first table heading column
      if (index > 0) isTableHeadingLine = tableHeading(line);
      if (!isTableHeadingLine) writer.write(`${line}\n`);
    });
  });
}

function main() {
  mergeFiles(['test1.csv', 'test2.csv'], writableStream, readStream);
}

main();
