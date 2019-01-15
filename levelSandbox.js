/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/
// Importing the module 'level'
const level = require('level');
// Declaring the folder path that store the data
const chainDB = './chaindata';
// Declaring a class
class LevelSandbox {
	// Declaring the class constructor
    constructor() {
    	this.db = level(chainDB);
    }
  
  	// Get data from levelDB with a key (Promise)
  	getLevelDBData(key){
        let self = this; // Because we are returning a promise, we will need this to be able to reference 'this' inside the Promise constructor
        return new Promise(function(resolve, reject) {
            self.db.get(key, (err, value) => {
                if(err){
                    if (err.type == 'NotFoundError') {
                        resolve(undefined);
                    }else {
                        console.log('Block ' + key + ' get failed', err);
                        reject(err);
                    }
                }else {
                    resolve(value);
                }
            });
        });
    }
  
  	// Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        let self = this;
        return new Promise(function(resolve, reject) {
            self.db.put(key, value, function(err) {
                if (err) {
                    console.log('Block ' + key + ' submission failed', err);
                    reject(err);
                }
                resolve(value);
            });
        });
    }
  
  	// Implement this method
    getBlocksCount() {
        let self = this;
        let count = 0;
        
        return new Promise(function(resolve, reject){
            self.db.createReadStream()
            .on('data', function (data) {
                count++;
            })
            .on('error', function (err) {
                reject(err);
            })
            .on('close', function () {
                resolve(count);
            })
        });
      	
    }

    //Get a block by its hash
    getBlockByHash(hash) {
        return new Promise((resolve, reject) => {
            let rs = this.db.createReadStream()
            rs.on('data', function (data) {
                let block = JSON.parse(data.value);
                if(block.hash === hash) {
                    resolve(block);
                    rs.destroy();
                }
            })
            rs.on('error', function (err) {
                reject(err);
            })
        });
    }

    //Get the blocks by the wallet address that created it
    getBlocksByWalletAddress(address) {
        return new Promise((resolve, reject) => {
            let blocks = [];
            let rs = this.db.createReadStream()
            rs.on('data', function (data) {
                let block = JSON.parse(data.value);
                if(block.data.address === address) {
                    blocks.push(block);
                }
            })
            rs.on('close', () => {
                resolve(blocks);
            })
            rs.on('error', function (err) {
                reject(err);
            })
        });
    }
}

// Export the class
module.exports.LevelSandbox = LevelSandbox;