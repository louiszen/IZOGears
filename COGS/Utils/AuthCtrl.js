const _ = require("lodash");
const { Accessor } = require("../../_CoreWheels/Utils");

class AuthCtrl {

  /**
   * @param {{
   *  Level: [Number],
   *  Groups: [String],
   *  Roles: [String],
   *  AuthTree: *
   * }} SYSAuth 
   */
  static SYSAuth2Ctrl(SYSAuth){
    let rtn = {
      Level: this.Level2Ctrl(SYSAuth.Level),
      Groups: this.Groups2Ctrl(SYSAuth.Groups),
      Roles: this.Roles2Ctrl(SYSAuth.Roles),
      AuthTree: this.AuthTree2Ctrl(SYSAuth.AuthTree),
      Users: this.Users2Ctrl(SYSAuth.Users)
    };
    return rtn;
  }

  static Level2Ctrl(level){
    return _.min(level);
  }

  static Users2Ctrl(users){
    let rtn = {};
    _.map(users, (o, i) => {
      rtn[o] = true;
    });
    return rtn;
  }

  static Groups2Ctrl(group){
    let rtn = {};
    _.map(group, (o, i) => {
      rtn[o] = true;
    });
    return rtn;
  }

  static Roles2Ctrl(roles){
    let rtn = {};
    _.map(roles, (o, i) => {
      rtn[o] = true;
    });
    return rtn;
  }

  static AuthTree2Ctrl(authtree, result = null, level = ""){
    if (!result) result = {};
    _.map(authtree, (o, i) => {
      if(_.isString(o)){
        result[level + "." + o] = true;
      }else{
        let nextlevel = level + (level === ""? i : ("." + i)); 
        result[nextlevel] = true;
        this.AuthTree2Ctrl(o, result, nextlevel);
      }
    });
    return result;
  }

  static Ctrl2AuthTree(refTree, ctrl, result = null, level = ""){
    if (!result) result = {};
    if(_.isArray(refTree)){
      let funcs = [];
      _.map(refTree, (o, i) => {
        let idx = level + (level === ""? o : ("." + o));
        if(ctrl[idx] === true){
          funcs.push(o);
        }
      });
      Accessor.Set(result, level, funcs);
    }else{
      _.map(refTree, (o, i) => {
        let idx = level + (level === ""? i : ("." + i));
        if(ctrl[idx] === true){
          Accessor.Set(result, idx, {});
          this.Ctrl2AuthTree(o, ctrl, result, idx);
        }
      });
    }
    return result;
  }

  static CombineCtrlOverride(ctrl, ...override){
    //override ctrl list
    for(let i=0; i<override.length; i++){
      ctrl = {
        ...ctrl,
        ...override[i]
      };
    }
    return ctrl;
  }

  static CombineOverrideFullAccess(baseAuthTree, ...override){

    let ctrl = this.AuthTree2Ctrl(baseAuthTree);

    let overrideCtrl = this.CombineCtrlOverride(ctrl, ...override);

    return this.Ctrl2AuthTree(baseAuthTree, overrideCtrl);

  }

}

module.exports = AuthCtrl;