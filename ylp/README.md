# YLP pdf Data Mining

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
$ ylp -f 1 -l 47 -n ylp.csv ylp.pdf
```

## Run in Production
Adds the module's main script to your systems path(See the bin key in package.json)
```
$  npm install -g
```

```
$  npm run build
```

## Note

> Make sure you have the right path to the nodeJs executable in the [index.js file](https://github.com/epicallan/uganda-budget-data/blob/master/index.js#L1)

## License
MIT © [Allan](http://github.com/epicallan)
