import DDeiBusCommand from "./bus/bus-command";

//已读取的命令
const COMMANDS: Map<string, DDeiBusCommand> = new Map();

/**
 * 添加command
 */
const addCommand = function (code: string, command: DDeiBusCommand) {
  COMMANDS.set(code, command)
}

/**
 * 动态加载command
 * @returns 
 */
//加载控件定义
const control_ctx = import.meta.glob('./bus/commands/*.ts', { eager: true })
let loadArray = [];
for (const path in control_ctx) {
  loadArray.push(control_ctx[path]);
}

loadArray.forEach(item => {

  let command = item.default;
  if (command) {
    let cmdInst: DDeiBusCommand = command.newInstance();
    if (cmdInst?.code) {
      addCommand(cmdInst.code, cmdInst)
    }
  }
})


export default COMMANDS;
export { COMMANDS, addCommand };
