import { expect } from 'chai';
import { getVoteTitle } from '../app.js';
/* eslint-disable no-unused-expressions */
describe('app.js tests', () => {
  it('should get us a valid vote titles for each line', () => {
    const currentVoteTitle = null;
    const testA = 'Vote: 102                       Electoral Commission';
    const testB = 'Vote hey  102';
    const testC = 'Vote: hey  102';
    const resultA = getVoteTitle(testA, currentVoteTitle);
    const resultB = getVoteTitle(testB, currentVoteTitle);
    const resultC = getVoteTitle(testC, currentVoteTitle);
    expect(resultA).to.be.equal('Electoral Commission');
    expect(resultB).to.be.null;
    expect(resultC).to.be.null;
  });
});
