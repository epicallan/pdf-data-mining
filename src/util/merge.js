import fs from 'fs';
import readline from 'readline';
import Rx from 'rxjs/Rx';
import path from 'path';

export const fromNodeStreamToObserverable = (stream, dataEventName, finishEventName) =>
  (Rx.Observable.create(observer => {
    stream.addListener(dataEventName, data => observer.next(data));
    stream.addListener('error', error => observer.error(error));
    stream.addListener(finishEventName, () => observer.complete());
    stream.resume();
    return () => {
      stream.removeAllListener(dataEventName);
    };
  }));

// returns a write stream for writing to the merge file
export const getWriter = (dir) => {
  const mergedCsvFilePath = dir ?
    path.resolve(dir, 'new1.csv') : path.resolve(__dirname, 'new.csv');
  return fs.createWriteStream(mergedCsvFilePath);
};

export const readLineObs = (filePath) => {
  const rl = readline.createInterface({ input: fs.createReadStream(filePath) });
  return fromNodeStreamToObserverable(rl, 'line', 'close');
};
// we dont want to have all the table headings from various
// tables in our final file, so when we find them
// we will skip them save for the first one
// const findTableHeading = (line) =>
//   (/(^\bVote Name\b)(.*\bTable Name\b)/.test(line));

export const readDirFiles = (dir, annex, prefix) => {
  let re = new RegExp('.csv$');
  const directory = dir || __dirname;
  if (annex) re = new RegExp(`(${annex})(?=\.csv$)`);
  if (prefix) re = new RegExp(`(^${prefix})(?=.*\.csv$)`);
  const stream = Rx.Observable.bindNodeCallback(fs.readdir);
  return stream(directory)
    .flatMap(files => Rx.Observable.from(files))
    .filter(file => re.test(file))
    .map(file => path.resolve(directory, file));
};

export const ob = (file) =>
  (Rx.Observable.create(observer => {
    observer.next(file);
  }));

export function writeToCsv(reader, writer) {
  return Rx.Observable.create(observer => {
    reader.on('line', (line) => {
      // we want to record the first table heading row
      observer.next(line);
      writer.write(line);
    });
    reader.on('error', (err) => observer.error(err));
    reader.on('close', () => observer.complete('finished'));
  });
}

export default function main() {
  // const streams = createsReadStreams(['test1.csv', 'test2.csv']);
  // writeToCsv(streams);
  // writeBuffersToFile(streams);
}

main();
