const express = require('express');
const bodyParser = require('body-parser');
const blockRoute = require('./routes/StarController');
const Mempool = require('./blockchain/Mempool');
const app = express();

//Build our mempool
const requestValidationTime = 5*60*1000;
const requestValidTime = 30*60*1000;
const mempool  = new Mempool.Mempool(requestValidationTime, requestValidTime);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:true}))

// parse application/json
app.use(bodyParser.json())

//Block controller
require('./routes/StarController')(app, mempool);

//POST endpoint to validate request
app.post('/requestValidation', (req, res) => {
    //Raised an error if the address field is not provided
    if(!req.body.address) return res.status(404).send('You must provide an address');

    //Add the validation request to the mempool
    let response = mempool.addValidationRequest(req.body.address);

    //Return the validation request object with all the infos
    return res.json(response);
});

//POST endpoint to validate a signature and give the authorization to save a star
app.post('/message-signature/validate', (req, res) => {
    //check that the body contains the 'address' and 'signature' fields
    if(!req.body.address || !req.body.signature) return res.status(404).send('You must provide the address of the wallet and the signature');

    try {
        return res.json(mempool.validateRequestByWallet(req.body.address, req.body.signature));
    } catch (error) {
        console.error(error);
        
        return res.status(404).send(error.message);
    }
})

app.listen(8000, () => console.log("App running on port 8000"));
