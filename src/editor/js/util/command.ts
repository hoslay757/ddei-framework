import type DDeiBusCommand from "@ddei-core/framework/js/bus/bus-command";
import { addCommand } from "@ddei-core/framework/js/command";

/**
 * 动态加载command
 * @returns 
 */
//加载控件定义

const autoLoadCommand = function(){
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
export { autoLoadCommand  }
export default autoLoadCommand
