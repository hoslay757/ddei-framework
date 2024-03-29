/**
 * 文件的状态定义
 */
enum DDeiFileState {
  //新建
  NEW = 1,
  //已修改
  MODIFY = 2,
  //已删除
  DELETE = 3,
  //无状态，正常状态
  NONE = 0,
  //正在保存
  SAVING = 4,
  //正在发布
  PUBLISHING = 5,
}

export default DDeiFileState
