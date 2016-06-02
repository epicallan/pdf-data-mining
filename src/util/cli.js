import program from 'commander';

program.version('0.0.1')
        .option('-d, --directory [n]', 'Can specify a directory default is current directory')
        .option('-p, --prefix [prefix]', 'can specify a file prefix')
        .option('-a, --annex [annex]', 'Can specify a file annex eg -test or -2')
        .parse(process.argv);

export default program;
