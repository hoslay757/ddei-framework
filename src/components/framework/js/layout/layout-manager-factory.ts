import DDeiRectContainer from "../models/rect-container";
/**
 * 布局管理器工厂
 */
class DDeiLayoutManagerFactory {
  // ============================ 静态方法 ============================
  static LayoutManagers: Map<string, DDeiLayoutManager> = new Map<string, DDeiLayoutManager>();
  /**
   * 根据layout获取layout实例
   */
  static getLayoutInstance(layout: string): DDeiLayoutManager {
    if (DDeiLayoutManagerFactory.LayoutManagers.size == 0) {
      let modules = import.meta.glob('./manager/*.ts', { eager: true });
      for (let i in modules) {
        let cls = modules[i].default;
        let newI = i.substring(i.lastIndexOf('-') + 1, i.lastIndexOf('.'))
        DDeiLayoutManagerFactory.LayoutManagers.set(newI, cls);
      }
    }
    if (layout) {
      let lm = DDeiLayoutManagerFactory.LayoutManagers.get(layout)?.newInstance();
      if (lm) {
        return lm
      }
    }
    return DDeiLayoutManagerFactory.LayoutManagers.get('free')?.newInstance();
  }

}

export default DDeiLayoutManagerFactory
