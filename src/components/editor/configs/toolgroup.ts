import { cloneDeep } from 'lodash'


const loadToolGroups = async function () {
  //加载控件原始定义信息
  const controlOriginDefinies = new Map();
  //加载控件定义
  const control_ctx = import.meta.glob('./controls/*.ts')
  let loadArray = [];
  for (const path in control_ctx) {
    loadArray.push(control_ctx[path]());
  }
  await Promise.all(loadArray).then(modules => {
    modules.forEach(item => {
      let controlDefine = item.default;
      controlDefine.styles = item.styles;
      controlDefine.datas = item.datas;
      controlDefine.events = item.events;
      // 排序属性
      if (controlDefine?.styles?.children) {
        parseAttrsToGroup(controlDefine.styles);
      }
      if (controlDefine?.datas?.children) {
        parseAttrsToGroup(controlDefine.datas);
      }
      if (controlDefine?.events?.children) {
        parseAttrsToGroup(controlDefine.events);
      }
      controlOriginDefinies.set(controlDefine.id, controlDefine);
    });
  })
  loadArray = [];
  //加载toolbox定义信息
  const ctx = import.meta.glob('./toolgroups/*.ts')
  for (const path in ctx) {
    loadArray.push(ctx[path]());
  }

  //组的定义
  const groupOriginDefinies = [];
  await Promise.all(loadArray).then(modules => {
    modules.forEach(item => {
      let group = item.default;
      //读取控件的信息,将实际的控件读取进到group中
      if (group.controls) {
        let cos = [];
        group.controls.forEach(control => {
          let id = control.id;
          let controlDefine = controlOriginDefinies.get(id);
          if (controlDefine) {
            //复制控件定义
            let c = cloneDeep(controlDefine);
            //复写group重点定义
            for (let i in control) {
              if (control[i]) {
                c[i] = control[i];
              }
            }
            //处理属性
            cos.push(c);
          }
        });
        // 内部控件排序
        cos.sort((a, b) => {
          return a.orderNo - b.orderNo
        })
        group.controls = cos;
      }
      groupOriginDefinies.push(group)
    })
  });
  return groupOriginDefinies;
}
//将属性转换为更深的groups中
const parseAttrsToGroup = function (attrs) {
  if (attrs?.children) {
    let newGroups = [];
    let lastGroupName = '';
    for (let i = 0; i < attrs.children.length; i++) {
      let curAttr = attrs.children[i];
      let groupName = curAttr.group;
      if (lastGroupName != groupName) {
        lastGroupName = groupName;
        newGroups.push({ "name": groupName, "children": [] });
      }
      newGroups[newGroups.length - 1].children.push(curAttr);
    }
    //对每个group中的属性进行排序
    newGroups.forEach(group => {
      // 内部属性排序
      group.children.sort((a, b) => {
        return a.orderNo - b.orderNo
      })
    });
    attrs.groups = newGroups;

  }

}
export default loadToolGroups;



// /**
//  * 扫描controls下所有控件
//  */
// const ctx = import.meta.glob('./toolgroups/*.js')
// const tgs = []
// for (const key of ctx.keys()) {
//   console.log("读取属性")
//   let group = ctx(key).default;
//   //获取控件定义
  // //读取控件的信息,将实际的控件读取进到group中
  // if (group.controls) {
  //   let cos = [];
  //   group.controls.forEach(control => {
  //     let id = control.id;
  //     let controlDefine = controls[id];
  //     if (controlDefine) {
  //       //复制控件定义
  //       let c = cloneDeep(controlDefine);
  //       //复写group重点定义
  //       for (let i in control) {
  //         if (control[i]) {
  //           c[i] = control[i];
  //         }
  //       }
  //       //处理属性
  //       cos.push(c);
  //     }
  //   });
  //   // 内部控件排序
  //   cos.sort((a, b) => {
  //     return a.orderNo - b.orderNo
  //   })
  //   group.controls = cos;
  // }
  // tgs.push(group)
// }
// // 分组排序
// tgs.sort((a, b) => {
//   return a.orderNo - b.orderNo
// })
