import fs from 'fs';
import readline from 'readline';
import program from './cli';

const spawn = require('child_process').spawn;

const pdftoTextProcess = () => (spawn('pdftotext',
['-layout', '-f', program.first, '-l', program.last, program.args[0]]));

// returns a write stream for writing to the resultant csv file
export const getWriter = () => {
  const fileName = typeof(program.name) === 'string' ? program.name : 'result.csv';
  // const resultCsvFile = path.resolve(currentDir, fileName);
  return fs.createWriteStream(fileName);
};

const csvLineTowrite = (line) =>
  (line.replace(/\s{2,}/g, '_') // replace all double spaces with a dash
      .replace(/,/g, '')  // replace all commas with nothing
      .replace(/_/g, ',')); // replace dash with comma //hence csv formatted line

const totalsLine = (arr) => {
  const fill = new Array(9);
  const first = arr.shift();
  fill[0] = first;
  const newArr = [...fill, ...arr];
  return newArr.join(',');
};

const lineQuack = (arr) => {
  const missing1 = arr[1].split(' ');
  if (missing1.length > 1) arr.splice(1, 1, ...missing1);
  const missing2 = arr[2].split(' ');
  if (missing2.length > 1 && /^\d/.test(arr[2])) {
    arr.splice(2, 1, ...missing2);
    if (arr.length === 13) arr.splice(3, 2, `${arr[3]} ${arr[4]}`);
    if (arr.length === 14) arr.splice(3, 3, `${arr[3]} ${arr[4]} ${arr[5]}`);
  }
  return arr;
};

const writeLineToFile = (line, writer) => {
  let csvLine = csvLineTowrite(line);
  const lineArr = csvLine.split(',');
  if (lineArr.length < 2) return false;
  if (!parseInt(lineArr[0], 10)) return false;
  if (lineArr.length === 4) csvLine = totalsLine(lineArr);
  // console.log(lineArr.length);
  if (lineArr.length > 8 && lineArr.length < 12) csvLine = lineQuack(lineArr);
  writer.write(`${csvLine}\n`); // writing to file
  return true;
};

const findTableHeader = (line) => (/DISB/g.test(line));

function writeCSVFile(readFileByLine, writer) {
  let startMining = false;
  let title = null;
  let noHeaderLine = true;
  readFileByLine.on('line', (line) => {
    const isTableHeader = findTableHeader(line);
    if (isTableHeader && noHeaderLine ) {
      startMining = true;
      title = line;
      console.log(`Title : ${title}`);
      writeLineToFile(line, writer); //we will only write the table headers once
      noHeaderLine  = false;
    }
    if (line.includes('MUNICIPALITY') || isTitle || line.includes('Page')) return false;
    if (startMining) writeLineToFile(line, writer);
    return true;
  });
}

const readByLine = () => {
  const minedTextFile = program.args[0].split('.');
  return readline.createInterface({
    input: fs.createReadStream(`${minedTextFile[0]}.txt`)
  });
};

const closeReadingTextFile = (readFileByLine, stream) => {
  readFileByLine.on('close', () => {
    stream.end();
    console.log('*finished reading files closing*');
    setTimeout(() => process.exit, 2000); // exit process
  });
};

function main() {
  const pdfMining = pdftoTextProcess();
  const csvWriter = getWriter();

  pdfMining.stderr.on('data', (data) => {
    console.log(`stderr : ${data}`);
    process.exit();
  });

  pdfMining.on('close', (code) => {
    console.log(`child process for PDFtoText exited with code  ${code}`);
    setTimeout(() => {
      const readFileByLine = readByLine();
      writeCSVFile(readFileByLine, csvWriter);
      closeReadingTextFile(readFileByLine, csvWriter);
    }, 2000);
  });
}

if (program.args.length && process.env.NODE_ENV !== 'test') main();
