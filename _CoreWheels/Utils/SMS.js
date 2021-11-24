
const { default: axios } = require('axios');
const SYSConfig = require("../../../__SYSDefault/SYSConfig");

class SMS {

  static async Send(tel, message){
    let msg = encodeURIComponent(message);
    let url = SYSConfig.SMS.PATH;
    url = url.replace("{{TEL}}", tel);
    url = url.replace("{{MSG}}", msg);

    try{
      await axios.get(url);
      return {Success: true};
    }catch{
      return {Success: false};
    }
  }

}

module.exports = SMS;