import fs from 'fs';
import readline from 'readline';

const spawn = require('child_process').spawn;

const rootPath = '/Users/allanlukwago/apps/budget-data/samples';

const sections = [];

const pdftoTextProcess = spawn('pdftotext',
['-layout', '-f', 3, '-l', 5, `${rootPath}/2014-15.pdf`]);

// returns a file stream, which the csv stream pipes into
const writableStream = (() => {
  const stream = fs.createWriteStream((`${rootPath}/bash.sh`));
  return stream;
})();


// transform sentences to array and removes empty elements(space)
const lineTowrite = (line) => line.split('  ').filter(word => word.length > 1);

function readInFile(readFileByLine) {
  readFileByLine.on('line', (line) => {
    const chunkedLine = lineTowrite(line);
    // console.log(chunkedLine, chunkedLine.length);
    if (chunkedLine.length === 2) {
      const pageCount = chunkedLine[0].replace(/[^0-9]/g, '');
      chunkedLine.splice(0, 0, pageCount);
      // console.log(chunkedLine);
    }
    if (!isNaN(chunkedLine[2] && chunkedLine.length === 3)) {
      if (chunkedLine[1] && !chunkedLine[1].includes('Annual Budget Performance Report')) {
        const startPageNumber = parseInt(chunkedLine[2], 10);
        const name = chunkedLine[1].replace(/[^a-z]/gi, '');
        sections.push({
          name,
          firstPage: startPageNumber
        });
      }
    }
  });
}

function writeBashCommands(sectionsToMine) {
  if (!sectionsToMine.length) console.error('error !!! data missing');
  sectionsToMine.forEach((section, index) => {
    let lastPage = 'N/A';
    const { name, firstPage } = section;
    if (index !== sections.length - 1) {
      lastPage = sections[index + 1].firstPage;
    } else {
      lastPage = 938;
    }
    /* eslint-disable max-len */
    const regularTablesCommand = `budget -f ${firstPage} -l ${lastPage - 1} -n ${name} 2014-15.pdf \n`;
    const overviewTablesCommand = `budget -o -f ${firstPage} -l ${firstPage + 1} -n ${name}-2 2014-15.pdf \n`;
    writableStream.write(regularTablesCommand);
    writableStream.write(overviewTablesCommand);
  });
}

function main() {
  const readFileByLine = readline.createInterface({
    input: fs.createReadStream(`${rootPath}/2014-15.txt`)
  });
  readInFile(readFileByLine);
  readFileByLine.on('close', () => {
    writeBashCommands(sections);
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
