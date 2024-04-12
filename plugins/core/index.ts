import DDeiCorePanels from "./panels"
import DDeiCoreComponents from "./components"
import DDeiCoreLayouts from "./layouts";
import DDeiCoreDialogs from "./dialogs";
import DDeiCorePropEditors from "./propeditors";
import DDeiCoreHotkeys from "./hotkeys";
import DDeiCoreControls from "./controls";
import DDeiPluginBase from "@ddei-core/plugin/ddei-plugin-base";

class DDeiCore extends DDeiPluginBase {
  type: string = "package"

  
  /**
   * 缺省实例
   */
  static defaultIns: DDeiCore = new DDeiCore(null);


  layouts: object = DDeiCoreLayouts;

  panels: object = DDeiCorePanels;

  components: object = DDeiCoreComponents;

  dialogs:object = DDeiCoreDialogs;

  propeditors: object = DDeiCorePropEditors;

  hotkeys: object = DDeiCoreHotkeys;

  controls: object = DDeiCoreControls;

  getOptions(): object {
    let options = {}
    let array = [this.layouts, this.panels, this.propeditors, this.dialogs, this.components, this.hotkeys, this.controls]
    array.forEach(plugin => {
      if (DDeiPluginBase.isSubclass(plugin, DDeiPluginBase)) {
        options = Object.assign({}, options, plugin.defaultIns.getOptions())
      } else if (plugin instanceof DDeiPluginBase) {
        options = Object.assign({}, options, plugin.getOptions())
      }
    });
    return options;
  }

  getComponents(editor) {
    if (DDeiPluginBase.isSubclass(this.components, DDeiPluginBase)) {
      return this.components.defaultIns.getComponents(editor);
    } else if (this.components instanceof DDeiPluginBase) {
      return this.components.getComponents(editor);
    }
  }

  getPanels(editor) {
    if (DDeiPluginBase.isSubclass(this.panels, DDeiPluginBase)) {
      return this.panels.defaultIns.getPanels(editor);
    } else if (this.panels instanceof DDeiPluginBase) {
      return this.panels.getPanels(editor);
    }
  }

  getLayouts(editor) {
    if (DDeiPluginBase.isSubclass(this.layouts, DDeiPluginBase)) {
      return this.layouts.defaultIns.getLayouts(editor);
    } else if (this.layouts instanceof DDeiPluginBase) {
      return this.layouts.getLayouts(editor);
    }
  }

  getDialogs(editor){
    if (DDeiPluginBase.isSubclass(this.dialogs, DDeiPluginBase)) {
      return this.dialogs.defaultIns.getDialogs(editor);
    } else if (this.dialogs instanceof DDeiPluginBase) {
      return this.dialogs.getDialogs(editor);
    }
  }

  getPropEditors(editor) {
    if (DDeiPluginBase.isSubclass(this.propeditors, DDeiPluginBase)) {
      return this.propeditors.defaultIns.getPropEditors(editor);
    } else if (this.propeditors instanceof DDeiPluginBase) {
      return this.propeditors.getPropEditors(editor);
    }
  }

  getHotKeys(editor) {
    if (DDeiPluginBase.isSubclass(this.hotkeys, DDeiPluginBase)) {
      return this.hotkeys.defaultIns.getHotKeys(editor);
    } else if (this.hotkeys instanceof DDeiPluginBase) {
      return this.hotkeys.getHotKeys(editor);
    }
  }

  getControls(editor) {
    if (DDeiPluginBase.isSubclass(this.controls, DDeiPluginBase)) {
      return this.controls.defaultIns.getControls(editor);
    } else if (this.controls instanceof DDeiPluginBase) {
      return this.controls.getControls(editor);
    }
  }

  getGroups(editor) {
    if (DDeiPluginBase.isSubclass(this.controls, DDeiPluginBase)) {
      return this.controls.defaultIns.getGroups(editor);
    } else if (this.controls instanceof DDeiPluginBase) {
      return this.controls.getGroups(editor);
    }
  }

  static configuraton(options) {
    let core = new DDeiCore(options);
    core.layouts = core.layouts.configuraton(options,true)
    core.panels = core.panels.configuraton(options,true)
    core.components = core.components.configuraton(options, true)
    core.dialogs = core.dialogs.configuraton(options, true)
    core.propeditors = core.propeditors.configuraton(options, true)
    core.hotkeys = core.hotkeys.configuraton(options, true)
    core.controls = core.controls.configuraton(controls, true)
    return core;
  }
}

export * from "./panels"
export * from "./components"
export * from "./layouts";
export * from "./dialogs";
export * from "./propeditors";
export * from "./hotkeys";
export {DDeiCore}
export default DDeiCore;