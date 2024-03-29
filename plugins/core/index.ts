import DDeiCorePanels from "./panels"
import DDeiCoreComponents from "./components"
import DDeiCoreLayouts from "./layouts";
let DDeiCore = {}
DDeiCore.addComponents = (editor) => {
  return DDeiCoreComponents.addComponents(editor);
}
DDeiCore.addPanels = (editor) => {
  return DDeiCorePanels.addPanels(editor);
}

DDeiCore.addLayouts = (editor) => {
  return DDeiCoreLayouts.addLayouts(editor);
}
export default DDeiCore