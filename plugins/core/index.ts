import DDeiCorePanels from "./panels"
import DDeiCoreComponents from "./components"
import DDeiCoreLayouts from "./layouts";
import DDeiCoreDialogs from "./dialogs";




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
export default DDeiCore