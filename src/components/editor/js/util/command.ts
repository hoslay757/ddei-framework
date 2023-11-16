import type DDeiBusCommand from "@/components/framework/js/bus/bus-command";
import { addCommand } from "@/components/framework/js/config/command";

/**
 * 动态加载command
 * @returns 
 */
//加载控件定义

const loadEditorCommands = function () {
  const control_ctx = import.meta.glob('../bus/commands/*.ts', { eager: true })
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
}

export default loadEditorCommands
export { loadEditorCommands }
