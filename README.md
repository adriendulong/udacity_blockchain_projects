# Node.js Framework used

For my RESTful API I used [expressjs](https://expressjs.com/) framework.

# Endpoints
## Validate a request

To validate a request make a POST request on `http://localhost:8000/requestValidation`
The POST must be JSON encoded and contains an `address` field.
For example:
```
{
    "address": "bitcoin_address"
}
```

This opens a 5 minutes validation window in order to validate the address

Return the address, the message to sign, and the validation window that is opened to validate this address:
```
{
    "walletAddress": "162HGuHpmzvQ13c8bZokoS2gxPLhPKiWmd",
    "requestTimeStamp": "1547546094",
    "message": "162HGuHpmzvQ13c8bZokoS2gxPLhPKiWmd:1547546094:starRegistry",
    "validationWindow": 300
}
```

## Validate an address
To validate an address you must send the message you obtained in the `/requestValidation` with this address signed with the same address.
In order to do that, do a POST request on `http://localhost:8000/message-signature/validate` 
The POST must be JSON encoded and contains the `address` and the `signature`:
```
{
	"address": "162HGuHpmzvQ13c8bZokoS2gxPLhPKiWmd",
	"signature": "IM1L1gwCH5bbe1kpp0gwj4GThIelEDvH3IzgI6qfNeJTebswz9EMmKbn80OD/H7sPRKKEX59kfVBdWtP8Lt05so="
}
```

This will open a 30 minutes window in order to post a star with this address.
The POST returns a response like this: 
```
{
    "registerStar": true,
    "status": {
        "address": "162HGuHpmzvQ13c8bZokoS2gxPLhPKiWmd",
        "requestTimeStamp": "1547546117",
        "message": "162HGuHpmzvQ13c8bZokoS2gxPLhPKiWmd:1547546094:starRegistry",
        "validationWindow": 1791,
        "messageSignature": true
    }
}
```



## Get a star by the block hash

To get a star from the blockchain by its hash make a GET request on `http://localhost:8000/stars/hash/:hash`

## Get a star by the block height

To get a star from the blockchain by its hash make a GET request on `http://localhost:8000/block/:height`

## Get all the stars of a wallet address

To get the stars from the blockchain by the wallet address that createsd it make a GET request on `http://localhost:8000/stars/hash/:hash`

It will return a collection of stars.

## To create a new star

To create a new block with some data inside make a POST request at `http://localhost:8000/block`
The POST must be JSON encoded and of this form:
For example:
```
{
    "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "star": {
                "dec": "68° 52' 56.9",
                "ra": "16h 29m 1.0s",
                "story": "Found star using https://www.google.com/sky/"
            }
}
```

It will return your story about the star hex encoded, and also the decoded story as `storyDecoded`
