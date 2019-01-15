/* ===== Blockchain Class ===============================
|  Class with a constructor for blockchain data model
|  with functions to support:
|    - createGenesisBlock()
|    - getLatestBlock()
|    - addBlock()
|    - getBlock()
|    - validateBlock()
|    - validateChain()
|  ======================================================*/
const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('../LevelSandbox.js');
const Block = require('./Block.js');
const hex2ascii = require('hex2ascii');

class Blockchain {
    constructor(){
      // Creating the levelSandbox class object
      this.db = new LevelSandbox.LevelSandbox();
      //Create the genesis block
      this.createGenesisBlock();
    }
    
    //createGenesisBlock, helper function that create a genesis block only if needed
    createGenesisBlock() {
      return new Promise((resolve, reject) => {
        this.db.getBlocksCount().then(count => {
            //We already have a genesis block
            if(count > 0) return true;
            else {
                let genesisBlock = new Block.Block("First block in the chain - Genesis block");
                genesisBlock.height = 0;
                genesisBlock.timeStamp = new Date().getTime().toString().slice(0,-3);
                genesisBlock.hash = SHA256(JSON.stringify(genesisBlock)).toString();
                return this.db.addLevelDBData(0, JSON.stringify(genesisBlock));
            }
        })
        .then(result => {
            resolve(result);
        })
        .catch(err => reject(err));
      })
    }
    
    //getLatestBlock method
    getLatestBlock() {
      return new Promise((resolve, reject) => {
        this.getBlockHeight().then(height => {
          return this.db.getLevelDBData(height);
        })
        .then(result => {
          resolve(JSON.parse(result));
        })
        .catch(err => reject(err));
      });
    }
  
    //getBlockHeight
    getBlockHeight() {
      return new Promise((resolve, reject) => {
        this.db.getBlocksCount().then(count => {
          if (count == 0) reject(Error('No block yet'));
          else resolve((count - 1));
        })
        .catch(err => {
          console.error(err);
          reject(err);
        })
      });
    }
  
    //getBlock by its height
    getBlockByHeight(height) {
      return new Promise((resolve, reject) => {
        this.db.getLevelDBData(height).then(result => {
          resolve(this._decodeBlockStory(JSON.parse(result)));
        })
        .catch(err => reject(err));
      })
    }

    //getBlockByHash 
    getBlockByHash(hash) {
      return new Promise((resolve,reject) => {
        this.db.getBlockByHash(hash).then(block => {
          resolve(this._decodeBlockStory(block));
        }).catch(err => reject(err));
      })
    } 

    //getBlocksByWalletAddress 
    getBlocksByWalletAddress(address) {
      return new Promise((resolve,reject) => {
        this.db.getBlocksByWalletAddress(address).then(blocks => {
          let blocksDecoded = [];
          for(let i = 0; i < blocks.length; i++){
            blocksDecoded.push(this._decodeBlockStory(blocks[i]))
          }
          resolve(blocksDecoded);
        }).catch(err => reject(err));
      })
    }
    
    //addBlock to the chain
    addBlock(newBlock){
      return new Promise((resolve, reject) => {
        this.getLatestBlock().then(lastestBlock => {
          newBlock.previousblockHash = lastestBlock.hash;
          newBlock.height = lastestBlock.height + 1;
          newBlock.timeStamp = new Date().getTime().toString().slice(0,-3);
          newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
          return this.db.addLevelDBData(lastestBlock.height + 1, JSON.stringify(newBlock));
        }).then(result => {
          resolve(this._decodeBlockStory(JSON.parse(result)));
        }).catch(err => {
          reject(err);
        });
      });
    }

    //decode the story of a block from hex
    _decodeBlockStory(block){
      block.data.star.storyDecoded = hex2ascii(block.data.star.story);
      return block;
    }
  
    //validateBlock check that a block is valid depending on its hash
    validateBlock(height) {
      return new Promise((resolve, reject) => {
        this.getBlock(height).then(block => {
          const actualHash = block.hash;
          block.hash = "";
          const supposedHash = SHA256(JSON.stringify(block)).toString();
          if (actualHash != supposedHash) {
            resolve(false);
          }
          //If it is the genesis block we don't need more validation
          else if (height == 0) {
            resolve(true);
          }
          //Otherwise we wan't to check if the previousblockHash equal to the hash of the previous block
          else {
            this.checkPreviousHash(block).then(result => resolve(result)).catch(err => reject(err));
          }
        })
        .catch(err => reject(err));
      })
    }
  
    //checkPreviousHash will check if the previousHash of a block is equal to the hash of the previous block
    checkPreviousHash(block) {
      return new Promise((resolve, reject) => {
        this.getBlock(block.height - 1).then(previousBlock => {
          if (previousBlock.hash == block.previousblockHash) resolve(true);
          else resolve(false);
        })
        .catch(err => reject(err));
      })
    }
  
    //validateChain validate all the block of the chain
    validateChain() {
      return new Promise((resolve, reject) => {
        this.getBlockHeight().then(height => {
          let promises = [];
          
          for(let i = 0; i<(height+1); i++){
            promises.push(new Promise((resolve, reject) => {
              this.validateBlock(i).then(result => {
                if(!result) resolve(`Error on block with height ${i}`);
                else resolve(result);
              })
              .catch(err => reject(err));
            }));
          }
          return Promise.all(promises);
        })
        .then(values => {
            let errorLogs = [];
            for(let i= 0; i< values.length; i++){
                if (values[i] != true) errorLogs.push(values[i])
            }
            resolve(errorLogs)
        })
        .catch(err => reject(err));
      })
    }

    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    _modifyBlock(height, block) {
        let self = this;
        return new Promise( (resolve, reject) => {
            self.db.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
                resolve(blockModified);
            }).catch((err) => { console.log(err); reject(err)});
        });
    }
}

module.exports.Blockchain = Blockchain;
