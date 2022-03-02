const AzureStorageBlob = require("../../External/AzureStorageBlob");
const SYSConfig = require("../../SYSConfig");
const { Initializable } = require("../../_CoreWheels/Extensible");
const { Chalk } = require("../../_CoreWheels/Utils");

class Blob extends Initializable{

  static async Init(){
    try{
      switch(SYSConfig.Blob.Provider){
        case "Azure":
          await AzureStorageBlob.OnLoad();
          break;
      }
      return {Success: true};
    }catch(e){
      console.log(Chalk.CLog("[-]", "Blob initialization fails: " + e));
      return {Success: false};
    }
  }

  static async CreateNewContainer(name){
    switch(SYSConfig.Blob.Provider){
      case "Azure":
        return await AzureStorageBlob.CreateNewContainer(name);
    }
  }

  static async ListContainers(){
    switch(SYSConfig.Blob.Provider){
      case "Azure":
        return await AzureStorageBlob.ListContainers();
    }
  }
  
  static async UploadNewBlob(buffer, extension = ""){
    this.ReInit();
    switch(SYSConfig.Blob.Provider){
      case "Azure":
        return await AzureStorageBlob.UploadNewBlob(buffer, extension);
    }
  }

  static async ListBlob(containerName){
    this.ReInit();
    switch(SYSConfig.Blob.Provider){
      case "Azure":
        return await AzureStorageBlob.ListBlob(containerName);
    }
  }

  static async DeleteBlob(blobName){
    this.ReInit();
    switch(SYSConfig.Blob.Provider){
      case "Azure":
        return await AzureStorageBlob.DeleteBlob(blobName);
    }
  }

  static async DownloadBlob(blobName){
    this.ReInit();
    switch(SYSConfig.Blob.Provider){
      case "Azure":
        return await AzureStorageBlob.DownloadBlob(blobName);
    }
  }

  static GetCurrentContainer(){
    switch(SYSConfig.Blob.Provider){
      case "Azure":
        return AzureStorageBlob.GetCurrentContainer();
    }
  }

  static GetContainerAt(moment){
    switch(SYSConfig.Blob.Provider){
      case "Azure":
        return AzureStorageBlob.GetContainerAt(moment);
    }
  }


}

module.exports = Blob;