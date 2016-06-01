import { expect } from 'chai';
import { readDirFiles } from '../merge.js';

describe('utils tests', () => {
  it('should return an Observable', (done) => {
    const source = readDirFiles();
    // const source2 = readDirFiles('-2');
    // const newSource = source.flatMap(files => Rx.Observable.from(files));
    source.subscribe(
      x => {
        console.log(x);
        expect(x).to.be.a('string');
      },
      err => {
        console.log(`Error ${err}`);
      },
      () => done()
    );
  });
});
