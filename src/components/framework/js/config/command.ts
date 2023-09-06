import DDeiBusCommand from "../bus/bus-command";

//已读取的命令
const COMMANDS: Map<string, DDeiBusCommand> = new Map();


/**
 * 动态加载command
 * @returns 
 */
const loadCommands = async function () {
  //加载控件定义
  const control_ctx = import.meta.glob('../bus/commands/*.ts')
  let loadArray = [];
  for (const path in control_ctx) {
    loadArray.push(control_ctx[path]());
  }
  await Promise.all(loadArray).then(modules => {
    modules.forEach(item => {
      let command = item.default;
      if (command) {
        let cmdInst: DDeiBusCommand = command.newInstance();
        if (cmdInst?.code) {
          addCommand(cmdInst.code, cmdInst)
        }
      }
    })
  });
  //返回克隆后的数据
  return COMMANDS;
}

/**
 * 添加command
 */
const addCommand = function (code: string, command: DDeiBusCommand) {
  COMMANDS.set(code, command)
}

export default loadCommands;
export { loadCommands, addCommand, COMMANDS };
