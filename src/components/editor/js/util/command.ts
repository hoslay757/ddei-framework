import type DDeiBusCommand from "@/components/framework/js/bus/bus-command";
import { COMMANDS, addCommand } from "@/components/framework/js/config/command";

/**
 * 动态加载command
 * @returns 
 */
const loadEditorCommands = async function () {
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
}


export default loadEditorCommands;
export { loadEditorCommands };
