import DDeiEnumAttributeType from '@/components/framework/js/enums/attribute-type';
import DDeiEditorArrtibute from '../js/attribute/editor-attribute';
import { cloneDeep } from 'lodash'

//已读取的配置组原始定义
const groupOriginDefinies = [];

//已读取的控件原始定义
const controlOriginDefinies = new Map();


const loadToolGroups = async function () {
  if (groupOriginDefinies.length == 0) {
    //加载控件定义
    const control_ctx = import.meta.glob('./controls/*.ts', { eager: true })
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
    let ctx = import.meta.glob('./toolgroups/*.ts', { eager: true })
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
  }
  //返回克隆后的数据
  return cloneDeep(groupOriginDefinies);
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
export default loadToolGroups;
export { loadToolGroups, groupOriginDefinies, controlOriginDefinies };
