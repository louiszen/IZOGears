/**
 * This script is to generate documents for azure pipelines settings.
 * 
 * Use `npm run genpipes` to run this script.
 */

const SYSGeneral = require("../../__SYSDefault/SYSGeneral");
const { Fs, Chalk } = require("../_CoreWheels/Utils");

( async () => {

  let id = SYSGeneral.ID.toLowerCase();
  let pipeline = `name: '$(SourceBranchName)_$(Date:yyyyMMdd)$(Rev:.r)'
trigger:
- none

resources:
- repo: self


variables:
- name: dockerRegistryServiceConnection
  value: 'gammondev ACR connection'
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
        - task: DownloadSecureFile@1
          name: SYSCredentials
          displayName: Download SYSCredentials
          inputs:
            secureFile: '${id}_SYSCredentials.js'
        - script: |
            sudo cp $(SYSCredentials.secureFilePath) $(Build.Repository.LocalPath)/${id}_SYSCredentials.js
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
        image: gammondev.azurecr.io/${id}-api-dev
        imagePullPolicy: Always
        ports:
        - containerPort: 7777`;
  await Fs.writeFile("manifest/dev/" + id + "-api-deployment.dev.yml", deployment);

  let ingress = `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    kubenetes.io/ingress.class: "nginx"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    kubernetes.io/ingress.class: internal
  name: ${id}-api-dev-ingress-internal
  namespace: aat-test
  labels:
    app: ${id}-api-dev
    name: ${id}-api-dev
    kind: ingress
    tier: api
    purpose: dev
    ingress: internal
spec:
  # ingressClassName: internal
  rules:
  - host: "${id}-api-poc.dev.gammonconstruction.com"
    http:
      paths:
      - pathType: Prefix
        path: "/"
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

  console.log(Chalk.Log("[v] Pipelines generated."));

})();