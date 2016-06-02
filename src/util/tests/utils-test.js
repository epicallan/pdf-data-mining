import { expect } from 'chai';
import path from 'path';
import { readDirFiles, readLineStream, getWriter } from '../merge.js';
/* eslint-disable no-unused-expressions */
describe('utils tests', () => {
  const rootPath = path.resolve(__dirname, '../../../samples');

  it('should return a stream of files with the word test as a prefix', (done) => {
    const source = readDirFiles(rootPath, null, 'test');
    // const source2 = readDirFiles('-2');
    // const newSource = source.flatMap(files => Rx.Observable.from(files));
    source.subscribe(
      fileName => {
        const bool = fileName.includes('test');
        expect(bool).to.be.true;
        expect(fileName).to.be.a('string');
      },
      err => {
        console.log(`Error ${err}`);
      },
      () => done()
    );
  });

  it('should return a stream of files with the -2 as an annex', (done) => {
    const source = readDirFiles(rootPath, '-2');
    // const source2 = readDirFiles('-2');
    // const newSource = source.flatMap(files => Rx.Observable.from(files));
    source.subscribe(
      fileName => {
        const bool = fileName.includes('-2');
        expect(bool).to.be.true;
        expect(fileName).to.be.a('string');
      },
      err => {
        console.log(`Error ${err}`);
      },
      () => done()
    );
  });
  it('should return all files in the directory', (done) => {
    const source = readDirFiles(rootPath);
    source.subscribe(
      fileName => {
        expect(fileName).to.be.a('string');
      },
      err => {
        console.log(`Error ${err}`);
      },
      () => done()
    );
  });

  it('should return lines from readline Observable', (done) => {
    // const writer = getWriter(rootPath);
    const file = path.resolve(rootPath, 'test1.csv');
    readLineStream(file).subscribe(
      lineToWrite => {
        expect(lineToWrite).to.have.length.above(2);
        expect(lineToWrite).to.be.a('string');
      },
      err => {
        console.log(`Error ${err}`);
      },
      () => done()
    );
  });

  it('should write lines from a stream of files to a csv file', (done) => {
    const writer = getWriter(rootPath, null, 'test');
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
          writer.write(`${line}\n`);
          expect(line).to.have.length.above(2);
          expect(line).to.be.a('string');
        },
        err => {
          console.log(`Error ${err}`);
        },
        () => done()
    );
  });
});
