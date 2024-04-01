import DDeiCorePanels from "./panels"
import DDeiCoreComponents from "./components"
import DDeiCoreLayouts from "./layouts";
import DDeiCoreDialogs from "./dialogs";
import DDeiCorePropEditors from "./propeditors";




let DDeiCore = {}

DDeiCore.addComponents = (app) => {
  return DDeiCoreComponents.addComponents(app);
}
DDeiCore.addPanels = (app) => {
  return DDeiCorePanels.addPanels(app);
}
DDeiCore.addLayouts = (app) => {
  return DDeiCoreLayouts.addLayouts(app);
}
DDeiCore.addDialogs = (app) => {
  return DDeiCoreDialogs.addDialogs(app);
}
DDeiCore.addPropEditors = (app) => {
  return DDeiCorePropEditors.addPropEditors(app);
}

// class Core {

//   options:object;
//   requeire: object[] = [];

//  constructor(options: object) {
//     this.options = options;
//  }
  
//   addComponents(){

//   }

//   static configuraton(options) {
//     let core = new Core(options);
//     return core;
//   }
// }


export default DDeiCore