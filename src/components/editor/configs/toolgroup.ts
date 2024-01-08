import DDeiEnumAttributeType from '@/components/framework/js/enums/attribute-type';
import DDeiEditorArrtibute from '../js/attribute/editor-attribute';
import { cloneDeep } from 'lodash'
import ICONS from "../js/icon";
//已读取的配置组原始定义
const groupOriginDefinies = [];

//已读取的控件原始定义
const controlOriginDefinies = new Map();


const loadControlByFrom = function (control) {
  if (control.from && !control.def) {
    let fromControl = controlOriginDefinies.get(control.from)
    if (fromControl.from) {
      loadControlByFrom(fromControl)
    }
    control.styles = cloneDeep(fromControl.styles)
    control.datas = cloneDeep(fromControl.datas)
    control.events = cloneDeep(fromControl.events)
    let fromMenus = cloneDeep(fromControl.menus)
    let fromDefine = cloneDeep(fromControl.define)
    //合并控件自身与from组件的define、menu
    if (fromDefine) {
      if (!control.define) {
        control.define = {};
      }
      for (let i in fromDefine) {
        if (!(control.define[i] || control.define[i] == 0)) {
          control.define[i] = fromDefine[i]
        }
      }
    }
    //处理ext
    if (control.define?.ext) {
      for (let i in control.define.ext) {

        //处理composes
        if (i == "composes") {
          let extComps = control.define?.ext.composes
          let defineComps = control.define.composes
          for (let j = 0; j < extComps.length; j++) {
            let extComp = extComps[j]
            let defComp = defineComps[j]
            //替换当前部分值
            if (defComp && !extComp.type) {
              for (let k in extComp) {
                defComp[k] = extComp[k]
              }
            }
          }
        } else if (i == "ovs") {
          let extOVS = control.define?.ext.ovs
          let defineOVS = control.define.ovs
          for (let j = 0; j < extOVS.length; j++) {
            let extComp = extOVS[j]
            let defComp = defineOVS[j]
            //替换当前部分值
            if (defComp && extComp) {
              for (let k in extComp) {
                defComp[k] = extComp[k]
              }
            }
          }
        } else if (i == "sample") {
          if (!control.define?.sample) {
            control.define.sample = {}
          }
          for (let j in control.define.ext.sample) {

            if (j != 'rules') {
              control.define.sample[j] = control.define.ext.sample[j]
            } else {
              if (!control.define.sample.rules) {
                control.define.sample.rules = []
              }
              control.define.ext.sample[j].forEach(rule => {
                control.define.sample.rules.push(rule)
              });
            }
          }
        } else {
          control.define[i] = control.define.ext[i]
        }

      }
      delete control.define.ext
    }

    //处理composes
    if (control.define?.composes) {
      control.define?.composes.forEach(compose => {
        let composeControlDefine = controlOriginDefinies.get(compose.id)
        if (composeControlDefine.from) {
          loadControlByFrom(composeControlDefine)
        }
        compose.styles = cloneDeep(composeControlDefine.styles)
        let composeDefine = cloneDeep(composeControlDefine.define)
        //合并控件自身与from组件的define、menu
        if (composeDefine) {

          for (let i in composeDefine) {
            if (!(compose[i] || compose[i] == 0)) {
              compose[i] = composeDefine[i]
            }
          }
        }
      });
    }

    //处理others
    loadControlOthers(control)

    if (fromMenus) {
      if (!control.menus) {
        control.menus = {};
      }
      for (let i in fromMenus) {
        if (!(control.menus[i] || control.menus[i] == 0)) {
          control.menus[i] = fromMenus[i]
        }
      }
    }


    control.menus = fromMenus

    control.attrDefineMap = new Map()
    if (control?.styles?.children) {
      parseAttrsToGroup(control, control.styles, DDeiEnumAttributeType.GRAPHICS);
    }
    if (control?.datas?.children) {
      parseAttrsToGroup(control, control.datas, DDeiEnumAttributeType.BUSINESS);
    }
    if (control?.events?.children) {
      parseAttrsToGroup(control, control.events, DDeiEnumAttributeType.EVENT);
    }
    control.type = fromControl.type
    controlOriginDefinies.set(control.id, control);
  }
  control.def = true;
};

const loadControlOthers = function (control) {
  if (control.others) {
    control.others.forEach(other => {
      let otherControlDefine = controlOriginDefinies.get(other.id)
      if (otherControlDefine.from) {
        loadControlByFrom(otherControlDefine)
      }
      other.code = otherControlDefine.code
      let otherDefine = cloneDeep(otherControlDefine.define)
      //合并控件自身与from组件的define、menu
      if (otherDefine) {
        for (let i in otherDefine) {
          if (!other.define) {
            other.define = {}
          }
          if (!(other.define[i] || other.define[i] == 0)) {
            other.define[i] = otherDefine[i]
          }
        }
      }
      other.type = otherControlDefine.type
      other.others = otherControlDefine.others
      loadControlOthers(other)


    });
  }
}

//将属性转换为更深的groups中
const parseAttrsToGroup = function (control, attrs, type) {
  if (attrs?.children) {
    let newGroups = [];
    let lastGroupName = '';
    for (let i = 0; i < attrs.children.length; i++) {
      let curAttr = attrs.children[i];
      if (!curAttr.type) {
        curAttr.type = type;
      }
      let attrDefine = new DDeiEditorArrtibute(curAttr);
      let groupName = curAttr.group;
      if (lastGroupName != groupName) {
        lastGroupName = groupName;
        newGroups.push({ "name": groupName, "children": [] });
      }
      newGroups[newGroups.length - 1].children.push(attrDefine);
      //将属性加入控件的属性map
      if (!control.attrDefineMap) {
        control.attrDefineMap = new Map();
      }
      control.attrDefineMap.set(curAttr.code, attrDefine);
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

//加载控件定义
const control_ctx = import.meta.glob('./controls/**', { eager: true })
let loadArray = [];
for (let i in control_ctx) {
  let cls = control_ctx[i];
  loadArray.push(cls);
}
let stage_ctx = import.meta.glob('./stage.ts', { eager: true })
for (let i in stage_ctx) {
  let cls = stage_ctx[i];
  loadArray.push(cls);
}
let layer_ctx = import.meta.glob('./layer.ts', { eager: true })
for (let i in layer_ctx) {
  let cls = layer_ctx[i];
  loadArray.push(cls);
}
loadArray.forEach(item => {
  let controlDefine = item.default;
  controlDefine.styles = item.styles;
  controlDefine.datas = item.datas;
  controlDefine.events = item.events;
  controlDefine.menus = item.menus;
  // 排序属性
  if (controlDefine?.styles?.children) {
    parseAttrsToGroup(controlDefine, controlDefine.styles, DDeiEnumAttributeType.GRAPHICS);
  }
  if (controlDefine?.datas?.children) {
    parseAttrsToGroup(controlDefine, controlDefine.datas, DDeiEnumAttributeType.BUSINESS);
  }
  if (controlDefine?.events?.children) {
    parseAttrsToGroup(controlDefine, controlDefine.events, DDeiEnumAttributeType.EVENT);
  }
  controlOriginDefinies.set(controlDefine.id, controlDefine);
})
loadArray = [];
//加载toolbox定义信息
let ctx = import.meta.glob('./toolgroups/**', { eager: true })
for (let path in ctx) {
  loadArray.push(ctx[path]);
}



//组的定义
loadArray.forEach(item => {
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
        //复写group中定义的属性
        for (let i in control) {
          if (control[i] != undefined && control[i] != null) {
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
});



//对分组进行排序
groupOriginDefinies.sort((a, b) => {
  return a.orderNo - b.orderNo
})

groupOriginDefinies.forEach((item, index) => {
  item.display = true;
  //缺省第一个展开
  if (index == 0) {
    item.expand = true;
  } else {
    item.expand = false;
  }
  //处理control
  item.controls.forEach((control) => {
    if (control.icon) {
      control.icon = ICONS[control.icon];
    }

    loadControlByFrom(control)

  });
});

export default groupOriginDefinies;
export { groupOriginDefinies, controlOriginDefinies };
