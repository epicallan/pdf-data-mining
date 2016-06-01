import { expect } from 'chai';
import { readDirFiles } from '../merge.js';

describe('utils tests', () => {
  const rootPath = '/Users/allanlukwago/apps/budget-data/samples';
  it('should return an Observable', (done) => {
    const source = readDirFiles(rootPath);
    // const source2 = readDirFiles('-2');
    // const newSource = source.flatMap(files => Rx.Observable.from(files));
    source.subscribe(
      x => {
        console.log('file is: ', x);
        expect(x).to.be.a('string');
      },
      err => {
        console.log(`Error ${err}`);
      },
      () => done()
    );
  });
});
