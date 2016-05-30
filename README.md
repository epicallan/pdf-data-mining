# Budget Data Mining
> Description
  Mines Budget data from uganda's budget PDF documents by first turning them
  to text using poppler's pdftotext utility.

> You can mine per vote or section or everything by specifying the first and last page in your budget mine command
  see [bash script](https://github.com/epicallan/uganda-budget-data/blob/master/samples/bash)

> All the tables with data that we are interested in are listed in the [config file](https://github.com/epicallan/uganda-budget-data/blob/master/src/config.js).
  The overview vote Expenditure table is different from the rest and hence the need for specifying the ``overview`` option
  when mining it.
  ```
    mining over view expenditure tables
  ```
  ```
  budget --overview -f 437 -l 438 -n health-over-views-expenditure 2014-15.pdf
  ```
  ```
  mining regular tables
  ```
  ```
  budget -f 437 -l 440 -n health-tables 2014-15.pdf
  ```
> A global install of the module will expose the budget command which can be used for
  the data mining.
  ```
    $ budget --help
  ```
  ```
   -h, --help         output usage information
   -V, --version      output the version number
   -f, --first <n>    Add first page
   -l, --last <n>     Add last page
   -o, --overview     indicates we are mining from overview vote expenditure table
   -n, --name [name]  Add resulting csv file name
  ```

  Pass in file location as last argument

  ```
    $ budget -f 100 -l 200 -n health-data allan/samples/2014-15.pdf
  ```

## External requirements

Ensure you have poppler's pdftotext utility installed on your OS's file path
>for linux

```
  sudo apt-get install poppler-utils
```

>for macs

```
  brew cask install pdftotext
```  

## Installation for development
```
$ npm install
```
## Run in development
symlinks the module's script to your systems path making it globally available (See the bin key in package.json)

```
$ npm run link
```

```
npm run dev
```
in another terminal run
```
$ budget -f 444 -l 447 -n health 2014-15.pdf
```

## Run in Production
Adds the module's main script to your systems path(See the bin key in package.json)
```
$  npm install -g
```

```
$  npm run build
```

run the budget data mining command
```
$ budget -f 444 -l 447 -n health 2014-15.pdf
  ```
## Note

> Make sure you have the right path to the nodeJs executable in the [index.js file](https://github.com/epicallan/uganda-budget-data/blob/master/index.js#L1)

## License
MIT © [Allan](http://github.com/epicallan)
