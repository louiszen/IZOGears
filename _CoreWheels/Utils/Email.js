const mailer = require("nodemailer");
const SYSConfig = require("../../../__SYSDefault/SYSConfig");

const Chalk = require("./Chalk/Chalk");

class Email {

  /**
   * 
   * @param {String} title 
   * @param {String} message 
   * @param {String | [String]} receivers 
   * @returns 
   */
  static async sendAlertMail(title, message, receivers){
    let transporter = mailer.createTransport({
      service: "Gmail",
      auth: {
        user: SYSConfig.Email.user,
        pass: SYSConfig.Email.pass
      }
    });  
  
    try {
      await transporter.sendMail({
        from: SYSConfig.Email.sender,
        to: receivers,
        subject: title || message,
        html: message
      });
      return {Success: true};
      
    }catch(e){
      let msg = "[x] Email :: Cannot send alert mail";
      console.error(Chalk.Log(msg), e);
      return {Success: false, payload: {Message: msg, Error: e}};
    }
  }

}

module.exports = Email; 

