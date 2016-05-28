import { expect } from 'chai';
import { getVoteTitle, shouldHaveNumericalValues } from '../app.js';
/* eslint-disable no-unused-expressions */
describe('app.js unit tests', () => {
  it('should get us a valid vote titles for each line', () => {
    const currentVoteTitle = null;
    const testA = 'Vote: 102                       Electoral Commission';
    const testB = 'Vote hey  102';
    const testC = 'Vote 102                       Electoral Commission';
    const resultA = getVoteTitle(testA, currentVoteTitle);
    const resultB = getVoteTitle(testB, currentVoteTitle);
    const resultC = getVoteTitle(testC, currentVoteTitle);
    expect(resultA).to.be.equal('Electoral Commission');
    expect(resultB).to.be.null;
    expect(resultC).to.be.null;
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
});
