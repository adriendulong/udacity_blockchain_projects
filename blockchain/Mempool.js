const bitcoinMessage = require('bitcoinjs-message'); 

/**
 * Mempool class
 * Class that contains the temporary validation requests and valid requests
 */

class Mempool {
    constructor(temporalValidationRequestTime, temporalValidRequestTime) {
        this.temporalValidationRequestTime = temporalValidationRequestTime;
        this.temporalValidRequestTime = temporalValidRequestTime;
        this.timeoutRequests = [];
        this.mempool = [];
        this.mempoolValid = [];
    }

    /**
     * addValidationRequest function
     * @param {*} address 
     * 
     * If there is already a request validation for this address we return the infos and the remaining time
     * Otherwirse the request validation is added to the mempool
     */
    addValidationRequest(address) {
        if(this.timeoutRequests[address]){
            let request = this.mempool[address];
            let timeElapse = (new Date().getTime().toString().slice(0,-3)) - request.requestTimeStamp;
            let timeLeft = (this.temporalValidationRequestTime/1000) - timeElapse;
            request.validationWindow = timeLeft;
            return request
        }
        else{
            const walletAddress = address;
            const requestTimeStamp = new Date().getTime().toString().slice(0,-3);

            let request = {
                walletAddress,
                requestTimeStamp,
                message: `${walletAddress}:${requestTimeStamp}:starRegistry`,
                validationWindow: 300
            };

            this.mempool[address] = request;
            this.timeoutRequests[address] = setTimeout(() => { this.removeValidationRequest(address); }, this.temporalValidationRequestTime);

            return request;
        }
    }

    /**
     * removeValidationRequest function
     * @param {*} address 
     * 
     * Remove from the mempool a validation request for the given address
     */
    removeValidationRequest(address) {
        delete this.mempool[address];
        delete this.timeoutRequests[address];
    }

    /**
     * removeValidRequest
     * @param {*} address 
     * 
     * Remove a valid request after 30 minutes
     */
    removeValidRequest(address) {
        delete this.mempoolValid[address];
        delete this.timeoutRequests[address];
    }

    /**
     * hasValidationRequest
     * @param {*} address 
     * 
     * Return true if there is a validation request for this address in the mempool
     */
    hasValidationRequest(address) {
        if(this.timeoutRequests[address]) return true;
        return false;
    }


    validateRequestByWallet(address, signature) {
        //Get the validation request from the mempool
        let request = this.mempool[address];

        //check if it exists, if not it means the we are outside a the validation window or that the validation request never existed
        if(!request) throw new Error('No validation request in the mempool for this wallet address');

        // Check the signature
        let isValid = bitcoinMessage.verify(request.message, address, signature.toString('base58'));
        if(!isValid) throw new Error('You signature is not valid');

        //We already have a pending valid request, update the validationWindow and returns it
        if (this.mempoolValid[address]) {
            let validRequest = this.mempoolValid[address];

            //get the updated validationWindow
           let timeElapse = (new Date().getTime().toString().slice(0,-3)) - validRequest.status.requestTimeStamp;
           let timeLeft = (this.temporalValidRequestTime/1000) - timeElapse;     
           
           validRequest.status.validationWindow = timeLeft;

           console.log(validRequest);
           
           return validRequest;
        }
        // Otherwise create a new one
        else {
           // Remove the valid request after 30 minutes
           this.timeoutRequests[address] = setTimeout(() => { this.removeValidRequest(address); }, this.temporalValidRequestTime);
           
           //add the element in the mempoolValid
           this.mempoolValid[address] = {
               registerStar: true,
               status: {
                   address,
                   requestTimeStamp: new Date().getTime().toString().slice(0,-3),
                   message: request.message,
                   validationWindow: this.temporalValidRequestTime/1000,
                   messageSignature: isValid
               }
           }

           console.log(this.mempoolValid[address]);
           

           //return the object 
           return this.mempoolValid[address];
        }
    }


}

module.exports.Mempool = Mempool;