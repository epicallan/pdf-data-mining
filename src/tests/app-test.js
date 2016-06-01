import { expect } from 'chai';
import {
  splitJoinedNumbers,
  getVoteTitle,
  shouldHaveNumericalValues,
  annexCsvLine } from '../app.js';
/* eslint-disable no-unused-expressions */
describe('app.js unit tests', () => {
  it('should get us a valid vote titles for each line', () => {
    const currentVoteTitle = null;
    const testA = 'Vote: 164                       Electoral Commission';
    const testB = 'Vote 102 Electoral Commission';
    const testC = 'Vote: 102 Electoral Commission';
    const resultA = getVoteTitle(testA, currentVoteTitle);
    const resultB = getVoteTitle(testB, currentVoteTitle);
    const resultC = getVoteTitle(testC, currentVoteTitle);
    expect(resultA).to.be.equal('Electoral Commission');
    // console.log('resultA', resultA);
    expect(resultB).to.be.null;
    // console.log('resultB', resultB);
    // console.log('resultC', resultC);
    expect(resultC).to.be.equal('Electoral Commission');
  });
  it('line should have numbers to be valid and have a particular length', () => {
    /* eslint-disable max-len */
    const lineA = 'VF:1651 Management  150.08      157.89      N/A       105.2%      79%    87.5%';
    const lineB = 'VF:1651 Management  150.08      157.89      hello       105.2%      79%    87.5%';
    const lineC = 'VF:1651  Management  150.08      157.89      23%      105.2%      79%    87.5%';
    const resultA = shouldHaveNumericalValues(lineA);
    const resultB = shouldHaveNumericalValues(lineB);
    const resultC = shouldHaveNumericalValues(lineC);
    expect(resultA).to.be.true;
    expect(resultB).to.be.false;
    expect(resultC).to.be.true;
  });
  it('should return a valid annex csvLine with all the values regardless of the spacing', () => {
    const lineA = 'VF:1651 Management  150.08      157.89      N/A       105.2%      79%    87.5%';
    const lineB = 'VF:1651 Management  150.08      157.89      N/A       105.2% 79%    87.5%';
    const lineC = '150.08 150.07   157.89      N/A       105.2% 79%    87.5%';
    const resultA = annexCsvLine(lineA);
    const resultB = annexCsvLine(lineB);
    const resultC = annexCsvLine(lineC);
    expect(resultC).to.have.length(7);
    expect(resultB).to.have.length(7);
    expect(resultA).to.have.length(7);
  });
  it('should split joined up numbers', () => {
    const joined = '0.2353.20';
    const result = splitJoinedNumbers(joined);
    expect(result).to.have.length(2);
    expect(result[0]).to.be.equal('0.23');
  });
});
