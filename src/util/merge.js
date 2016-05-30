import fs from 'fs';
import readline from 'readline';
// import Rx from 'rxjs/Rx';

const buffers = new Map(); // for storing file data
const rootPath = '/Users/allanlukwago/apps/budget-data/samples';

// returns a write stream for writing to the merge file
const writableStream = () => {
  const stream = fs.createWriteStream((`${rootPath}/merged.csv`));
  return stream;
};

const readStream = (fileName) => (
  readline.createInterface({
    input: fs.createReadStream(`${rootPath}/${fileName}`)
  }));

// we dont want to have all the table headings from various
// tables in our final file, so when we find them
// we will skip them save for the first one
const findTableHeading = (line) =>
  (/(^\bVote Name\b)(.*\bTable Name\b)/.test(line));


const createsReadStreams = (files) =>
  (files.map((fileName) => readStream(fileName)));

export const hello = () => 'hello';

export const readDirFiles = () => {

};

function fillDataBuffers(readerStreams) {
  let isATableHeadingLine = false;
  readerStreams.forEach((stream, index) => {
    const streamData = [];
    stream.on('line', (line) => {
      // we want to record the first table heading row
      if (index > 0) isATableHeadingLine = findTableHeading(line);
      if (!isATableHeadingLine) {
        streamData.push(`${line}\n`);
        buffers.set(index, streamData);
      }
    });
  });
}

function writeBuffersToFile(readerStreams) {
  const writer = writableStream();
  readerStreams.forEach((stream, index) => {
    stream.on('close', () => {
      const buffer = buffers.get(index);
      // cleanup buffers
      buffers.delete(index);
      // write each line to file
      buffer.forEach(line => writer.write(line));
    });
  });
}

export default function main() {
  const streams = createsReadStreams(['test1.csv', 'test2.csv']);
  fillDataBuffers(streams);
  writeBuffersToFile(streams);
}

main();
