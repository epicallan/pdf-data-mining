import { expect } from 'chai';
import { readDirRx } from '../merge.js';

describe('utils tests', () => {
  it('should return an Observable', () => {
    const observable = readDirRx();
    observable.subscribe((value) => {
      console.log('arr', value);
      expect(value).to.be.a('string');
    });
  });
});
