const mailer = require("nodemailer");
const SYSCredentials = require("../../SYSCredentials");

const Chalk = require("./Chalk/Chalk");

class ZEmail {

  /**
   * 
   * @param {String} title 
   * @param {String} message 
   * @param {String | [String]} receivers 
   * @returns 
   */
  static async sendAlertMail(title, message, receivers){
    let transporter = mailer.createTransport({
      service: SYSCredentials.Email.Service,
      auth: {
        user: SYSCredentials.Email.User,
        pass: SYSCredentials.Email.Password
      }
    });  
  
    try {
      await transporter.sendMail({
        from: SYSCredentials.Email.Sender,
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

module.exports = ZEmail; 

