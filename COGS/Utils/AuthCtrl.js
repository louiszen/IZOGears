const _ = require("lodash");
const { Accessor } = require("../../_CoreWheels/Utils");

class AuthCtrl {

  /**
   * @param {{
   *  Level: [Number],
   *  Groups: [String],
   *  Roles: [String],
   *  AuthTree: *,
   *  Users: [String],
   *  Companies: [String]
   * }} SYSAuth 
   * @param {{
   *  Level: [Number],
   *  Groups: [String],
   *  Roles: [String],
   *  AuthTree: *,
   *  Users: [String],
   *  Companies: [String]
   * }} old 
   */
  static SYSAuth2Ctrl(SYSAuth, old){
    let rtn = {
      Level: this.Level2Ctrl(SYSAuth.Level, old?.Level),
      Groups: this.Groups2Ctrl(SYSAuth.Groups, old?.Groups),
      Roles: this.Roles2Ctrl(SYSAuth.Roles, old?.Roles),
      AuthTree: this.AuthTree2Ctrl(SYSAuth.AuthTree, null, "", old?.AuthTree),
      Users: this.Users2Ctrl(SYSAuth.Users, old?.Users),
      Companies: this.Companies2Ctrl(SYSAuth.Companies, old?.Companies)
    };
    return rtn;
  }

  static Level2Ctrl(level, old){
    return _.min(old || level);
  }

  static Users2Ctrl(users, old){
    let rtn = {};
    _.map(users, (o, i) => {
      if(old && old[o] !== undefined){
        rtn[o] = old[o];
      }else{
        rtn[o] = true;
      }
    });
    return rtn;
  }

  static Groups2Ctrl(group, old){
    let rtn = {};
    _.map(group, (o, i) => {
      if(old && old[o] !== undefined){
        rtn[o] = old[o];
      }else{
        rtn[o] = true;
      }
    });
    return rtn;
  }

  static Companies2Ctrl(companies, old){
    let rtn = {};
    _.map(companies, (o, i) => {
      if(old && old[o] !== undefined){
        rtn[o] = old[o];
      }else{
        rtn[o] = true;
      }
    });
    return rtn;
  }

  static Roles2Ctrl(roles, old){
    let rtn = {};
    _.map(roles, (o, i) => {
      if(old && old[o] !== undefined){
        rtn[o] = old[o];
      }else{
        rtn[o] = true;
      }
    });
    return rtn;
  }

  static AuthTree2Ctrl(authtree, result = null, level = "", old){
    if (!result) result = {};
    _.map(authtree, (o, i) => {
      if(_.isString(o)){
        let idx = level + "." + o;
        if(old && old[idx] !== undefined){
          result[idx] = old[idx];
        }else{
          result[idx] = true;
        }
      }else{
        let nextlevel = level + (level === ""? i : ("." + i)); 
        if(old && old[nextlevel] !== undefined){
          result[nextlevel] = old[nextlevel];
        }else{
          result[nextlevel] = true;
        }
        this.AuthTree2Ctrl(o, result, nextlevel, old);
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