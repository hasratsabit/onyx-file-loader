const fs= require('fs');
const path = require('path');

class FilesLoader {

    isDirectory(source) {
        return fs.lstatSync(source).isDirectory(); 
    }

    processFile(fileName, filterIdentifier) {
        if(!fileName || !filterIdentifier) throw new Error("One of the parameters is missing.");
        let splitedFileName = fileName.split(".");
        if(!splitedFileName && splitedFileName.length < 2) return false;
        return splitedFileName.some(splitedName => splitedName === filterIdentifier);
    }

    loadFilesPath(directoryPath) {
        let directoryContents = fs.readdirSync(directoryPath);
        let filesPathArray = [];
        for(let content of directoryContents) {
            let filesPath;
            let innerContents = path.join(directoryPath, content);
            if(this.isDirectory(innerContents)) {
               filesPath = this.loadFilesPath(innerContents);
            } else {
                filesPath = innerContents;
            }
            filesPathArray.push(filesPath);
        }
    
        let combinedFilesPathArray = [].concat.apply([], filesPathArray);
        return combinedFilesPathArray;  
    }

    loadFiles(directory, identifier = "") {
        if(!directory) throw new Error("One or more parameters are missing.");
        let identifierExist = true;
        if(!identifier || identifier.length === 0) identifierExist = false;
        let filesPathArray = this.loadFilesPath(directory);
        if(!filesPathArray || filesPathArray.length === 0) return [];
        let loadedFilesArray = [];
        for(let filePath of filesPathArray) {
            let baseFileName = path.basename(filePath);
            let isFileMatched = identifierExist ? this.processFile(baseFileName, identifier) : true;
            let loadedFile;
            if(isFileMatched) loadedFile = require(path.resolve(filePath));
            let objectType = Object.keys(loadedFile).length !== 0;
            if(typeof loadedFile === 'function' || typeof loadedFile === objectType) loadedFilesArray.push(loadedFile); 
        }
        return loadedFilesArray;
    }
}

class FilesLoaderSingleton {
    static getInstance() {
        if(!FilesLoaderSingleton.instance) FilesLoaderSingleton.instance = new FilesLoader();
        return FilesLoaderSingleton.instance;
    }
}


module.exports = FilesLoaderSingleton;