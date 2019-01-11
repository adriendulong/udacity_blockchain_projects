const express = require('express');
const router = express.Router();
const BlockChain = require('../BlockChain.js');
const Block = require('../Block.js');

let myBlockChain = new BlockChain.Blockchain();

/**
 * Simple utilisty function that says with are in the block route
 * and what time it is
 */

router.use((req, res, next) => {
    console.log(`Call on Block route at ${Date.now()}`);
    next();
});

//Get a block given the height of this block
router.get('/:index', (req, res) => {
    //Check if the height of the block is provided
    if(!req.params.index) return res.status(404).send("Need the height of the block");
    
    //Transform it to an int
    const height = parseInt(req.params.index);
    
    //Check that the height is positive
    if(height < 0) return res.status(404).send("The height must be positive");

    //Get the max height of the blockchain in order to be sure that the height provided
    //in the request is equal or inferior
    myBlockChain.getBlockHeight().then(maxHeight => {
        if(height > maxHeight) throw new Error('The height provided is above the max height of the chain');
        return myBlockChain.getBlock(height);
    })
    .then(block => {
        if(!block) throw new Error('Problem getting the block');
        return res.json(block);
    })
    .catch(err => res.status(404).send(err.message))
});

/**
 * POST a new block on the chain
 */

 router.post('/', (req, res) => {
     if(!req.body.body) return res.status(404).send('Provide a body in order to build a new block');

     let newBlock = new Block.Block(req.body.body);

     //Add the block to our blockchain
     myBlockChain.addBlock(newBlock).then(result => {
         //Return the block in a JSON format
         return res.json(JSON.parse(result));
     })
     .catch(err => res.status(404).send(err.message));
 })

module.exports = router;