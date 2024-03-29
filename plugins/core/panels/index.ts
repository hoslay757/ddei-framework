import TopMenu from './topmenu/TopMenu.vue';
import Toolbox from './toolbox/Toolbox.vue';
import QuickColorView from './quickcolor/QuickColorView.vue';
import PropertyView from './propertyview/PropertyView.vue';
import OpenFilesView from './openfilesview/OpenFilesView.vue';
import CanvasView from './canvasview/CanvasView.vue';
import BottomMenu from './bottommenu/BottomMenu.vue';

let DDeiCorePanels = {}
DDeiCorePanels.addPanels = (editor) => {
  let panels = [TopMenu, Toolbox, QuickColorView, PropertyView, OpenFilesView, CanvasView, BottomMenu]
  let returnPanel = {}
  panels.forEach(panel => {
    let name = "ddei-core-" + panel.name
    panel.name = name;
    panel.install = (app) => {
      app.component(name, panel)
      return app
    }
    returnPanel[name] = panel
  });
  return returnPanel;
}

export default DDeiCorePanels