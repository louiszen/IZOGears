const SYSCredentials = require("../SYSCredentials");
const appInsights = require("applicationinsights");
const { Chalk } = require("../_CoreWheels/Utils");
const SYSConfig = require("../SYSConfig");

class ApplicationInsights {

  static Init() {
    if(SYSConfig.Extra.ApplicationInsights){
      console.log(Chalk.Log("[-] Setting up Azure ApplicationInsights..."));
      Chalk.Log = (v) => v; //NO COLOR Override
      appInsights.setup(SYSCredentials.External.ApplicationInsights.ConnectionString)
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true, true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(true, true)
        .setUseDiskRetryCaching(true)
        .setAutoCollectPreAggregatedMetrics(true)
        .setSendLiveMetrics(true)
        .setAutoCollectHeartbeat(false)
        .setInternalLogging(false, true)
        .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
        .start();
    }
  }
}

module.exports = ApplicationInsights;