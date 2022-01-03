class ZGen {

  /**
   * 
   * @param {String} start 
   * @param {String} end 
   */
  static Alphabet(start = "A", end = "Z"){
    let rtn = [];
    let startC = start.charCodeAt(0);
    let lastC  = end.charCodeAt(0);
    for (let i = startC; i <= lastC; ++i) {
      rtn.push(String.fromCharCode(i));
    }

    return rtn;
  }

  static Number(length = 0){
    let rtn = [];
    for(let i = 0; i<length; i++){
      rtn.push(Math.floor(Math.random() * 10));
    }

    return rtn;
  }

  /**
   * 
   * @param {Number} length 
   * @param {Number} bitmask 0b1111, [special, numbers, lowercase, uppercase]
   * @returns 
   */
  static Key(length = 0, bitmask = 0b1111){
      let uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let lowercase = "abcdefghijklmnopqrstuvwxyz";
      let numbers = "0123456789";
      let special  = "~!@#$%^&*(){}[],./?";
      let characters = "";
      if (bitmask & 1) {
        characters += uppercase;
      }      
      if (bitmask & 2) {
        characters += lowercase;
      }
      if (bitmask & 4) {
        characters += numbers;
      }
      if (bitmask & 8) {
        characters += special;
      }
      if (!characters) {
        characters = uppercase + lowercase;
      }
      let charactersLength = characters.length;
      let randomString = "";
      for (let i = 0; i < length; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * (charactersLength - 1)));
      }
      return randomString;
  }
}

module.exports = ZGen;