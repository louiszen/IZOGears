let requireComponent = require.context(
  '',
  false,
  /.js$/
)

let list = {}

requireComponent.keys().forEach((fileName) => {

  let componentName = fileName
    .replace(/^\.\//, '')
    .replace(/\.\w+$/, '')
    .replace(/js/, '')

  if(componentName === "index"){ 
    return;
  }
  
  let doc = require("./" + componentName).default;
  
  list[componentName] = doc;
})


export default list;