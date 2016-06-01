import { expect } from 'chai';
import { readDirFiles } from '../merge.js';

describe('utils tests', () => {
  it('should return an Observable', () => {
    const source = readDirFiles();
    source.subscribe(
      x => {
        console.log(`Next: ' ${x}`);
        expect(x).to.be.a('string');
      },
      err => {
        console.log(`Error ${err}`);
      });
  });
});
