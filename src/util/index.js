import fs from 'fs';
import readline from 'readline';

const spawn = require('child_process').spawn;

const pdftoTextProcess = spawn('pdftotext',
['-layout', '-f', 3, '-l', 5, '2014-15.pdf']);

// returns a file stream, which the csv stream pipes into
const writableStream = (() => {
  const stream = fs.createWriteStream('bash.sh');
  return stream;
})();


// transform sentences to array and removes empty elements(space)
const lineTowrite = (line) => line.split('  ').filter(word => word.length > 1);

function readInFile(segments, readFileByLine) {
  readFileByLine.on('line', (line) => {
    const chunkedLine = lineTowrite(line);
    if (!isNaN(chunkedLine[0])) writableStream.write(`${line}\n`);
  });
}

function main() {
  const readFileByLine = readline.createInterface({
    input: fs.createReadStream('2014-15.txt')
  });
  readInFile(readFileByLine);
  readFileByLine.on('close', () => {
    console.log('*finished reading files closing*');
  });
}

pdftoTextProcess.stderr.on('data', (data) => {
  console.log(`stderr : ${data}`);
  process.exit();
});

pdftoTextProcess.on('close', (code) => {
  console.log(`child process exited with code  ${code}`);
  setTimeout(main(), 3000);
});
