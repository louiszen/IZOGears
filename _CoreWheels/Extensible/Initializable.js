const BaseClass = require("../BaseClass");
const Time = require("../Utils/Time");

const { v1 } = require("uuid");
class Initializable extends BaseClass {

  /**
   * OVERRIDE Initialization Scripts
   * as long as return {Success: boolean}
   * @note Do NOT directly call this method.
   * @param {*} params 
   */
  static async Init(params){
    return {Success: true};
  }

  /**
   * ReInit scripts, call before execution of other core functions
   * @readonly Do NOT change or override.
   */
  static async ReInit(){
    if(this.__INIT) return true;
    await this.OnLoad(this.__PARAMS);
    return this.__INIT;
  }

  /**
   * OnLoad scripts, call it once on starts up
   * @readonly Do NOT change or override.
   * @param {*} params 
   */
  static async OnLoad(params){
    this.__PARAMS = params;
    let now = Time.Now();
    this.__ID = v1();
    try{
      let rtn = await this.Init(this.__PARAMS);
      if(rtn.Success){
        console.log(this.CLog("Module Initialized. (" + Time.Lapse(now) + "s)", "[I][o]"));
        this.__INIT = true;
      }else{
        console.error(this.CLog("Module Initialize Failed - ", "[I][x]"));
        this.__INIT = false;
      }
    }catch(e){
      console.error(this.CLog("Fatal Error Thrown during Module Initialization", "[I][x]"));
      console.error(e);
      this.__INIT = false;
      throw new Error(e);
    }
  }

  /**
   * If true, update will throw Error when fail
   * @param {Boolean} flag 
   */
  static SetThrowError(flag = true){
    this.__ThrowError = flag;
  }

}

module.exports = Initializable;