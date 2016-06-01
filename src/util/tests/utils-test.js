import { expect } from 'chai';
import path from 'path';
import { readDirFiles, readLineObs, getWriter, ob } from '../merge.js';

describe('utils tests', () => {
  const rootPath = '/Users/allanlukwago/apps/budget-data/samples';

  it('should return a stream files', (done) => {
    const source = readDirFiles(rootPath);
    // const source2 = readDirFiles('-2');
    // const newSource = source.flatMap(files => Rx.Observable.from(files));
    source.subscribe(
      x => {
        // console.log('file is: ', x);
        expect(x).to.be.a('string');
      },
      err => {
        console.log(`Error ${err}`);
      },
      () => done()
    );
  });

  it('should return lines from readline Observable and write to file', (done) => {
    // const writer = getWriter(rootPath);
    const file = path.resolve(rootPath, 'test1.csv');
    readLineObs(file).subscribe(
      lineToWrite => {
        // writer.write(`${lineToWrite}\n`);
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
    // const writer = getWriter(rootPath);
    const source = readDirFiles(rootPath)
      .map(file => readLineObs(file));

    source.subscribe(
      line => {
        console.log(line);
        // writer.write();
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
