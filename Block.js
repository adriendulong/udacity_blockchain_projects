/* ===== Block Class ============================
|  Class with a constructor for block			 |
|  ==============================================*/

class Block {
	constructor(data){
     this.hash = "";
     this.height = 0;
     this.data = data;
     this.timeStamp = 0;
     this.previousblockHash = "0x";
    }
}

module.exports.Block = Block;