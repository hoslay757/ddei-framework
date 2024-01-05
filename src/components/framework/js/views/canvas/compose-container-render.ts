import DDeiConfig from '../../config';
import DDeiEnumOperateType from '../../enums/operate-type';
import DDeiAbstractShape from '../../models/shape';
import DDeiRectContainerCanvasRender from './rect-container-render';
/**
 * DDeiComposeContainer的渲染器类，用于渲染一个普通的容器
 * 渲染器必须要有模型才可以初始化
 * 模型应该操作渲染器，而不是操作canvas
 */
class DDeiComposeContainerCanvasRender extends DDeiRectContainerCanvasRender {

  // ============================== 静态方法 ============================
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static newInstance(props: object): DDeiComposeContainerCanvasRender {
    return new DDeiComposeContainerCanvasRender(props)
  }

  // ============================== 属性 ===============================

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiComposeContainerCanvasRender";
  // ============================== 方法 ===============================
}

export default DDeiComposeContainerCanvasRender