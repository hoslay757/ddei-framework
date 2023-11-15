//初始化外部配置
const config = {
  //允许打开多文件
  GLOBAL_ALLOW_OPEN_MULT_FILES: true,

  //允许多sheet编辑
  GLOBAL_ALLOW_OPEN_MULT_SHEETS: true,

  //允许多图层编辑
  GLOBAL_ALLOW_OPEN_MULT_LAYERS: true,

  //允许全局缩放
  GLOBAL_ALLOW_STAGE_RATIO: true,

  //允许快捷编辑颜色
  GLOBAL_ALLOW_QUICK_COLOR: true,

  //默认模式标识，模式标识对应以ac_开头的访问权限配置
  GLOBAL_DEFAULT_MODE_NAME: "DESIGN",

  /**
   * 全局权限配置，按照配置自动读取规则
   * 配置规则：ac_模式_操作_功能项
   * 模式标识：可以自定义，模式只是用来区分权限分组，可以全局设置或由组件参数传入
   * 操作：create（创建控件）、edit（编辑控件）、view（查看控件）、drag（拖拽控件）、link（建立连线）、del（删除控件）、select（选中控件）
   * 功能项：ModelType < ModelCode < Code < Id
   */
  AC_DESIGN_CREATE: true,
  AC_DESIGN_EDIT: true,
  AC_DESIGN_VIEW: true,
  AC_DESIGN_DRAG: true,
  AC_DESIGN_LINK: true,
  AC_DESIGN_DEL: true,
  AC_DESIGN_SELECT: true,

  SELECTOR: {
    //选择器边框
    border: {
      width: 1,
      color: "red",
      selected: {
        width: 1,
        color: "blue",
      },
    },
  },
};

export default config