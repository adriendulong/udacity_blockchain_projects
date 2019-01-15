const BlockChain = require('../blockchain/BlockChain.js');
const Block = require('../blockchain/Block.js');

class StarController {
    constructor(app, mempool) {
        this.myBlockChain = new BlockChain.Blockchain();
        this.app = app;
        this.mempool = mempool;
        this.getStarByHash();
        this.getStarsByWalletAddress();
        this.getStarByHeight();
        this.postNewStar();
    }

    getStarByHash(){
        //Get a block given the hash of this block
        this.app.get('/stars/hash/:hash', (req, res) => {
            //Check if the hash of the block is provided
            if(!req.params.hash) return res.status(404).send("Need the hash of the block");

            this.myBlockChain.getBlockByHash(req.params.hash).then(blocks => {
                if(!block) throw new Error('Problem getting the block');
                return res.json(block);
            })
            .catch(err => res.status(404).send(err.message))
        });
    }

    getStarsByWalletAddress(){
        //Get a block given the hash of this block
        this.app.get('/stars/address/:address', (req, res) => {
            //Check if the address of the block is provided
            if(!req.params.address) return res.status(404).send("Need the wallet address");

            this.myBlockChain.getBlocksByWalletAddress(req.params.address).then(block => {
                if(!block) throw new Error('Problem getting the block');
                return res.json(block);
            })
            .catch(err => res.status(404).send(err.message))
        });
    }

    /**
     * getStarByHeight()
     * Return the block of a star depending of its height
     */

    getStarByHeight(){
        //Get a block given the height of this block
        this.app.get('/block/:index', (req, res) => {
            //Check if the height of the block is provided
            if(!req.params.index) return res.status(404).send("Need the height of the block");
            
            //Transform it to an int
            const height = parseInt(req.params.index);
            
            //Check that the height is positive
            if(height < 0) return res.status(404).send("The height must be positive");

            //Get the max height of the blockchain in order to be sure that the height provided
            //in the request is equal or inferior
            this.myBlockChain.getBlockHeight().then(maxHeight => {
                if(height > maxHeight) throw new Error('The height provided is above the max height of the chain');
                return myBlockChain.getBlockByHeight(height);
            })
            .then(block => {
                if(!block) throw new Error('Problem getting the block');
                return res.json(block);
            })
            .catch(err => res.status(404).send(err.message))
        });
    }

    /**
     * postNewStar()
     * POST endpoint to create a new block that will store the star
     */
    postNewStar() {
        this.app.post('/block', (req, res) => {
            if(!req.body.address || !req.body.star) return res.status(404).send('Provide a wallet address & a star infos');

            //check that this address has been validated
            if(!this.mempool.mempoolValid[req.body.address]) return res.status(404).send('You must validate your address before posting a new star');

            //build the body of the block
            let body = {
                address: req.body.address,
                star: {
                    ra: req.body.star.ra,
                    dec: req.body.star.dec,
                    story: Buffer.from(req.body.star.story).toString('hex')
                }
            }
            let newBlock = new Block.Block(body);

            //Add the block to our blockchain
            this.myBlockChain.addBlock(newBlock).then(result => {
                return res.json(result);
            })
            .catch(err => res.status(404).send(err.message));
        })
    }
}

module.exports = (app, mempool) => {return new StarController(app, mempool)};