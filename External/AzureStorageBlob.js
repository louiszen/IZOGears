const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");
const { v1 } = require("uuid");
const SYSGeneral = require("../../__SYSDefault/SYSGeneral");
const SYSConfig = require("../SYSConfig");
const SYSCredentials = require("../SYSCredentials");
const { Initializable } = require("../_CoreWheels/Extensible");
const { Chalk, Time } = require("../_CoreWheels/Utils");

class AzureStorageBlob extends Initializable {

  static async Init(){
    let {Account, AccountKey} = SYSCredentials.External.AzureStorageBlob;
    let sharedKeyCredential = new StorageSharedKeyCredential(Account, AccountKey);
    let serviceURL = "https://" + Account + ".blob.core.windows.net";
    this.client = new BlobServiceClient(serviceURL, sharedKeyCredential);
    console.log(this.CLog("Azure Storage Blob Connected."));
    return {Success: true};
  }

  static async ContainerExists(name){
    this.ReInit();
    let containers = await this.ListContainers();
    return containers.includes(name);
  }

  /**
   * 
   * @param {String} name 
   */
  static async CreateNewContainer(name){
    this.ReInit();
    await this.client.createContainer(name, {
      access: "blob"
    });
    console.log(Chalk.CLog("[-]", "Container (" + name + ") Created."));
  }

  /**
   * 
   * @returns {[String]}
   */
  static async ListContainers(){
    this.ReInit();
    let rtn = [];
    let containers = this.client.listContainers();
    for await (const container of containers) {
      rtn.push(container.name);
    }

    return rtn;
  }

  /**
   * 
   * @param {String} name 
   */
  static async RemoveContainer(name){
    this.ReInit();
    await this.client.deleteContainer(name);
    console.log(Chalk.CLog("[-]", "Container (" + name + ") Deleted."));
  }

  /**
   * Get current container
   * @returns {String}
   */
  static GetCurrentContainer(){
    return this.GetContainerAt(Time.Now());
  }

  /**
   * Get container at a specific time
   * @param {import("moment").Moment} moment 
   */
  static GetContainerAt(moment){
    let prefix = SYSGeneral.ID;
    if(SYSConfig.Blob.Azure.FolderInterval === "Nil"){
      return prefix;
    }
    let format = "YYYYMM";
    switch(SYSConfig.Blob.Azure.FolderInterval){
      case "Daily": format = "YYYYMMDD"; break;
      default: 
      case "Monthly": format = "YYYYMM"; break;
      case "Yearly": format = "YYYY"; break;
    }
    return prefix + "-" + moment.format(format);
  }

  /**
   * 
   * @param {String} blobName 
   * @returns 
   */
  static Decode(blobName){
    let splitExt = blobName.split(".");
    let extension = splitExt.length > 1 ? "." + splitExt[1] : "";
    let splitMain = splitExt[0].split("-");
    return {
      projectID: splitMain[0],
      containerName: splitMain[1],
      blobID: splitMain[2],
      extension: extension
    };
  }

  /**
   * `${ProjectID}-${containerName}-${blobID}${extension}`
   * eg. qsk-202202-djhkewhtrodfherwtgjdfjkgh.jpg
   * @param {String} containerName 
   * @param {String} extension 
   * @returns 
   */
  static GetNewBlobName(containerName, extension){
    let prefix = SYSGeneral.ID;
    let blobID = v1();
    return [prefix, containerName, blobID].join("-") + extension;
  }

  static async UploadNewBlob(buffer, extension = ""){
    this.ReInit();
    let currentContainer = this.GetCurrentContainer();

    let blobName = this.GetNewBlobName(currentContainer, extension);

    if(!await this.ContainerExists(currentContainer)){
      await this.CreateNewContainer(currentContainer);
    }

    let containerClient = this.client.getContainerClient(currentContainer);
    let blobClient = containerClient.getBlockBlobClient(blobName);

    let uploadRes = await blobClient.uploadData(buffer);
    if(!uploadRes.errorCode){
      console.log(Chalk.CLog("[-]", "File is stored as " + blobName 
        + " in Container (" + currentContainer + ")."));
      return {Success: true, payload: blobName};
    }else{
      console.log(Chalk.CLog("[x]", "Upload Error: " + uploadRes.errorCode));
      return {Success: false, payload: uploadRes.errorCode};
    }
  }

  static async ListBlob(containerName){
    this.ReInit();
    let containerClient = this.client.getContainerClient(containerName); 
    let blobs = containerClient.listBlobsFlat();
    let rtn = [];
    for await (const blob of blobs){
      rtn.push({
        name: blob.name, 
        lastModified: blob.properties.lastModified
      });
    }
    return rtn;
  }

  static async DeleteBlob(blobName){
    this.ReInit();
    let decoded = this.Decode(blobName);
    let containerClient = this.client.getContainerClient(decoded.containerName);
    let blobClient = containerClient.getBlockBlobClient(blobName); 
    let deleteRes = await blobClient.deleteIfExists();
    if(deleteRes.succeeded){
      console.log(Chalk.CLog("[-]", "File stored as " + blobName 
        + " in Container (" + decoded.containerName + ") is deleted."));
      return {Success: true};
    }else{
      console.log(Chalk.CLog("[x]", "Delete Error: " + deleteRes.errorCode));
      return {Success: false, payload: deleteRes.errorCode};
    }
  }

  static async DownloadBlob(blobName){
    this.ReInit();
    let decoded = this.Decode(blobName);
    let containerClient = this.client.getContainerClient(decoded.containerName);
    let blobClient = containerClient.getBlockBlobClient(blobName);
    
    let downloadBuffer = await blobClient.downloadToBuffer();
    return downloadBuffer;
  }

}

module.exports = AzureStorageBlob;