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
      stream.removeAllListeners(dataEventName);
    };
  }));

// returns a write stream for writing to the resultant csv file
export const getWriter = (dir) => {
  const resultCsvFile = dir ?
    path.resolve(dir, 'merge.csv') : path.resolve(__dirname, 'merge.csv');
  return fs.createWriteStream(resultCsvFile);
};

// Rx Observable that reads csv file by line and emits the lines as a stream
export const readLineStream = (filePath) => {
  const rl = readline.createInterface({ input: fs.createReadStream(filePath) });
  return fromNodeStreamToObserverable(rl, 'line', 'close');
};

// returns a stream of files from a specified directory or current directory
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

function main() {
  const rootPath = program.directory || __dirname;
  const writer = getWriter(rootPath, program.annex, program.prefix);
  let tableHeaderRow = null;
  readDirFiles(rootPath)
    .flatMap(file => readLineStream(file))
    .filter(line => {
      if (!tableHeaderRow) {
        tableHeaderRow = line; // the tableHeaderRow is the very first line
        return true;
      }
      return !line.includes(tableHeaderRow);
    })
    .subscribe(
      line => {
        writer.write(`${line}\n`); // writing to file
      },
      err => {
        console.log(`Error ${err}`);
      },
      () => { console.log('done'); }
    );
}

if (process.env.NODE_ENV !== 'test') main();
