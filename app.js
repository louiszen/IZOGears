"use strict";
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const multer = require("multer");
const app = express();
const _ = require("lodash");

const _base = require("./_CoreWheels");
const _config = require("./SYSConfig");
const _remote = require("../remoteConfig");

const cores = require("../__SYSDefault/APIConfig/cores");
const inits = require("../__SYSDefault/APIConfig/inits");

const ByPass = require("../__SYSDefault/APIConfig/bypass");
const TempStore = require("./COGS/Storage/TempStore");

const LRequest = require("./COGS/Log/LRequest");
const LSignIn = require("./COGS/Log/LSignIn");

const { Accessor } = require("./_CoreWheels/Utils");
const ZGate = require("./COGS/ZGate/ZGate");
const { v1 } = require("uuid");

const {Chalk, Response} = _base.Utils;

let SYSReqAuth = null;
try{
  SYSReqAuth = require("../SYSReqAuth");
  console.log(Chalk.Log("[-] Using SYSReqAuth.js as System API Authority Tree."));
}catch{
  console.log(Chalk.Log("[x] No SYSReqAuth found. Please run `npm run auth`."));
  process.exit();
}

app.use(helmet()); //XSS protection 
app.use(express.json());
app.use(express.urlencoded({
  extended: true,
  limit: "10mb"
}));
app.use(cors());
app.use("/Images", express.static("Images"));

/*Dynamic Routing*/
async function Start(){

  await _remote.OnLoad();

  //Auto Init
  if(_config.Init.OnStart){
    console.log(Chalk.Log("[-] Auto Initialization."));
    await cores.CommonAPI.Env.Init({});
  }
  //init all
  await ZGate.OnLoad();
  await LRequest.OnLoad();
  await LSignIn.OnLoad();
  await TempStore.OnLoad();

  await Promise.all(_.map(inits, async (o, i) => {
    await o.OnLoad();
  }));

  app.get("/HealthCheck", async (req, res) => {
    let rtn = {
      Success: true
    };
    res.send(rtn);
  });

  app.post("/:cat/:subcat/:action", multer().single("upload"), async (req, res) => {
    let {cat, subcat, action} = req.params;
    try {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      console.log(Chalk.Log("[<] Request << [" + action + "] " + Chalk.Color("on", "grey") + " [" + cat + Chalk.Color("/", "grey") + subcat +"]"));
      console.log(Chalk.Log("[<] Data << "));
      console.log(req.body);
      if(req.file){
        console.log(Chalk.Log("[<] File << "));
        console.log(req.file);
      }

      //Not Found 
      let func = Accessor.Get(cores, cat + "." + subcat + "." + action);
      if(!func){
        console.error(Chalk.Log("[x][>] Wrong Path Request >> "));
        res.sendStatus(404);
        return;
      }

      let validate;
      let username;

      if(!ByPass.Includes(cat, subcat, action)){
        //not bypass, need validate
        validate = await ZGate.Validate(req.body);
        if(!validate.Success){
          res.status(200);
          let message = validate.payload;
          console.error(Chalk.Log("[x][>] " + message));
          res.send(Response.SendError(4001, message + "\nPlease Login Again."));
          return;
        }

        username = validate.payload;

        //Authority
        let reqAuthority = Accessor.Get(SYSReqAuth, _.join([cat, subcat, action], "."));
        if(!reqAuthority){
          let message = "No Authority has been set. Please run `npm run auth`.";
          console.error(Chalk.Log("[x][>] " + message));
          res.send(Response.SendError(4003, message));
          return;
        }
        let accessible = await ZGate.IsAccessible(username, reqAuthority);
        if(!accessible){
          res.status(200);
          let message = "No Access Authority";
          console.error(Chalk.Log("[x][>] " + message));
          res.send(Response.SendError(4003, message));
          return;
        }
      }
  
      res.status(200);
      username = username || ("Anonymous-" + v1());
      
      //Call Object
      LRequest.Write(username, req);
      let rtn = await func(req.body, req.params, username, req.file, res);
      console.log(Chalk.Log("[o][>] Success Sent"));
      res.send(rtn);
  
    }catch(e){
      console.error(Chalk.Log("[x] Error :: "));
      console.error(e);
      res.send(Response.SendError(9001, e.message? e.message : e));
    }
  });
}

Start();

module.exports = app;
