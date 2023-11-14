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