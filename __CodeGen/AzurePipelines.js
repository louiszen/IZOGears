/**
 * This script is to generate documents for azure pipelines settings.
 * 
 * Use `npm run genpipes` to run this script.
 */

const SYSGeneral = require("../../__SYSDefault/SYSGeneral");
const { Fs, Chalk } = require("../_CoreWheels/Utils");
const _ = require("lodash");

( async () => {

  let id = SYSGeneral.ID.toLowerCase();
  let pipeline = `name: '$(SourceBranchName)_$(Date:yyyyMMdd)$(Rev:.r)'
trigger:
- none

resources:
- repo: self


variables:
- name: dockerRegistryServiceConnection
  value: 'digitalgdev-ACR-service-connection'
- name: imageRepository
  value: '${id}-api-dev'
- name: tag
  value: "$(Build.BuildNumber)"
- name: vmImageName
  value: "ubuntu-latest" 
- name: dockerfilePath
  value: "**/Dockerfile-dev"
- name: env
  value: $(SourceBranchName)

stages:

- stage: build_${id}_api_stage
  displayName: Build ${id} API stage
  dependsOn: []

  jobs:
    - job: build_${id}_api_image
      displayName: Build ${id} API Image
      pool:
        vmImage: $(vmImageName)
      steps:
        - checkout: self  # identifier for your repository resource
          clean: false  # if true, execute \`execute git clean -ffdx && git reset --hard HEAD\` before fetching
          submodules: true # set to 'true' for a single level of submodules or 'recursive' to get submodules of submodules; defaults to not checking out submodules
        - task: Docker@2
          displayName: Build and push an image to container registry
          inputs:
            command: buildAndPush
            repository: $(imageRepository)
            dockerfile: $(dockerfilePath)
            containerRegistry: $(dockerRegistryServiceConnection)
            tags: |
              $(tag)
              latest
        - script: |
            ls $(Build.Repository.LocalPath)`;

  await Fs.writeFile("pipelines/" + id + "-api-azure-pipelines.dev.yml", pipeline);

  let deployment = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${id}-api-dev
  labels:
    app: ${id}apidev
    name: ${id}-api-dev
    kind: deployment
    tier: api
    purpose: dev
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${id}apidev
      name: ${id}-api-dev
      kind: deployment
      tier: api
      purpose: dev
  template:
    metadata:
      labels:
        app: ${id}apidev
        name: ${id}-api-dev
        kind: deployment
        tier: api
        purpose: dev
    spec:
      containers:
      - name: api
        image: digitalgdev.azurecr.io/${id}-api-dev
        imagePullPolicy: Always
        ports:
        - containerPort: 7777
        volumeMounts:
        - name: config-volume
          mountPath: /app/${id}_SYSCredentials.json
          subPath: ${id}_SYSCredentials.json
      volumes:
      - name: config-volume
        configMap:
          name: ${id}-api-configmap-dev`;
  await Fs.writeFile("manifest/dev/" + id + "-api-deployment.dev.yml", deployment);

  let ingress = `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
  name: ${id}-api-dev-ingress-external
  namespace: ${id}
  labels:
    app: ${id}-api-dev
    name: ${id}-api-dev
    kind: ingress
    tier: api
    purpose: dev
    ingress: external
spec:
  ingressClassName: external
  rules:
  - host: "${id}-dev.digital-g.tech"
    http:
      paths:
      - path: /()(.*)
        pathType: Prefix
        backend:
          service:
            name: ${id}-web-dev-svc
            port: 
              number: 80
      - path: /api(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: ${id}-api-dev-svc
            port: 
              number: 80`;

  await Fs.writeFile("manifest/dev/" + id + "-api-ingress.dev.yaml", ingress);

  let service = `apiVersion: v1
kind: Service
metadata:
  name: ${id}-api-dev-svc
  labels:
    app: ${id}apidev
    name: ${id}-api-dev
    kind: service
    tier: api
    purpose: dev
spec:
  selector:
    app: ${id}apidev
    name: ${id}-api-dev
    kind: deployment
    tier: api
    purpose: dev
  ports:
  - port: 80
    targetPort: 7777`;
  await Fs.writeFile("manifest/dev/" + id + "-api-service.dev.yml", service);

  let credentialJSON = await Fs.readFile("./"+id+"_SYSCredentials.json");
  let configmap = `
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: ${id}
  name: ${id}-api-configmap-dev
data:
  ${id}_SYSCredentials.json: |
`;

  let splited = credentialJSON.toString().split("\n");
  _.map(splited, (o, i) => {
    configmap += "    " + o;
  });

  await Fs.writeFile("manifest/dev/" + id + "-api-configmap.dev.yml", configmap);

  console.log(Chalk.Log("[v] Pipelines generated."));

})();