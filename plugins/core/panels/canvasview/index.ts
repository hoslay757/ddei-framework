import DDeiPluginBase from "@ddei-core/plugin/ddei-plugin-base";
import CanvasView from './CanvasView.vue';

class DDeiCoreCanvasViewPanel extends DDeiPluginBase{
  
  name: string = CanvasView.name
  /**
   * 缺省实例
   */
  static defaultIns: DDeiCoreCanvasViewPanel = new DDeiCoreCanvasViewPanel(null);

  static getPanels(editor){
    return DDeiCoreCanvasViewPanel.defaultIns.getPanels(editor);
  }

  static getOptions(): object {
    return DDeiCoreCanvasViewPanel.defaultIns.getOptions();
  }

  plugins: object[] = [CanvasView]

  getPanels(editor){
    return this.plugins;
  }


  static getName(): string {
    return DDeiCoreCanvasViewPanel.defaultIns.getName();
  }

  static getType(): string {
    return DDeiCoreCanvasViewPanel.defaultIns.getType();
  }
  
  static configuraton(options, fullConfig: boolean = false) {
    //解析options，只使用自己相关的
    if (options) {
      let newOptions = {}
      if (fullConfig) {
        if (fullConfig) {
          if (options[CanvasView.name]) {
            for (let i in options[CanvasView.name]) {
              newOptions[i] = options[CanvasView.name][i]
            }
          }
        }
      } else {
        newOptions = options
      }
      if (newOptions && Object.keys(newOptions).length !== 0) {
        let panels = new DDeiCoreCanvasViewPanel(newOptions);
        return panels;
      }
    }
    return DDeiCoreCanvasViewPanel;
  }
}

export default DDeiCoreCanvasViewPanel