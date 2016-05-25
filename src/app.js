// import path from 'path';
import fs from 'fs';
import readline from 'readline';
import verEx from 'verbal-expressions';

const rl = readline.createInterface({
  input: fs.createReadStream('/Users/allanlukwago/apps/budget-data/samples/2014-15.txt')
});

const fileLines = [];
let isTable = false;
// let index = 0;
rl.on('line', (line) => {
  const tester = verEx().find('Releases and Expenditure by Vote Function');
  const endTester = verEx().find('Excluding Taxes and Arrears');
  const isEnd = endTester.test(line);
  // const expression = verEx().find('Expenditures');
  if (tester.test(line)) isTable = true;
  if (isTable) {
    // index ++;
    if (line && !isEnd) {
      // const words = line.split(' ').map(word => { if (word.length > 2) return word })
      // console.log(line);
      fileLines.push(line);
      // console.log('----------------------');
    }
    if (isEnd) {
      isTable = false;
      rl.close();
    }
  }
});

rl.on('close', () => {
  console.log(fileLines[6]);
});
