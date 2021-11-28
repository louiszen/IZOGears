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
}

module.exports = ZGen;