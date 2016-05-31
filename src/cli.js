import program from 'commander';

program.version('0.0.1')
        .option('-f, --first <n>', 'Add first page')
        .option('-l, --last <n>', 'Add last page')
        .option('-o, --overview', 'indicates we are mining from overview vote expenditure tables')
        .option('-a, --annex', 'indicates that we want to mine annex tables')
        .option('-e, --estimates', 'indicates that we want to mine the estimates tables')
        .option('-n, --name [name]', 'Add resulting csv file name');

program.on('--help', () => {
  console.log('  Example:');
  console.log('');
  console.log('   Pass in file location as last argument');
  console.log('');
  console.log('    $ budget -f 443 -l 447 -n health 2014-15.pdf');
  console.log('');
});

program.parse(process.argv);

export default program;
