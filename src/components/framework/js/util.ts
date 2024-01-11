import DDeiConfig from './config.js'
import DDeiAbstractShape from './models/shape.js';
import { clone, cloneDeep, isDate, isNumber, isString } from 'lodash'
import DDei from './ddei.js';
import { Matrix3, Vector3 } from 'three';
const expressBindValueReg = /#\{[^\{\}]*\}/;
const contentSplitReg = /\+|\-|\*|\//;
const isNumberReg = /^[+-]?\d*(\.\d*)?(e[+-]?\d+)?$/;
const safariReg = /Safari/;
const chromeReg = /Chrome/;
const ytestReg = /(y+)/;

class DDeiUtil {



  // ============================ 静态方法 ============================

  //钩子函数，调用外部的配置属性读取函数,由外部调用者初始化
  static getAttrValueByConfig: Function;
  //钩子函数，调用外部的配置属性读取函数,由外部调用者初始化
  static getControlDefine: Function;

  //钩子函数，获取菜单的函数，由外部调用者初始化
  static getMenuConfig: Function;

  //钩子函数，获取菜单的控件ID，用于显示菜单，控制样式等
  static getMenuControlId: Function;
  //钩子函数，设置当前右键菜单
  static setCurrentMenu: Function;
  //钩子函数，显示右键菜单
  static showContextMenu: Function;
  //钩子函数，返回控件的子控件定义，用于创建控件时自动创建子控件
  static getSubControlJSON: Function;
  //钩子函数，返回线控件的定义
  static getLineInitJSON: Function;
  //钩子函数，获取业务数据
  static getBusiData: Function;
  //钩子函数，获取快捷编辑文本框
  static getEditorText: Function;


  static offsetX: number;
  static offsetY: number;
  static screenX: number;
  static screenY: number;


  //计算贝塞尔曲线坐标时，用到的常量
  static p331t3 = Math.pow(1 - 0.333, 3)
  static p331t2 = Math.pow(1 - 0.333, 2)
  static p33t2 = Math.pow(0.333, 2)
  static p33t3 = Math.pow(0.333, 3)
  static p33t21t3 = 3 * (1 - 0.333) * DDeiUtil.p33t2
  static p331t2t3 = 3 * DDeiUtil.p331t2 * 0.333


  static p661t3 = Math.pow(1 - 0.666, 3)
  static p661t2 = Math.pow(1 - 0.666, 2)
  static p66t2 = Math.pow(0.666, 2)
  static p66t3 = Math.pow(0.666, 3)

  static p661t2t3 = 3 * DDeiUtil.p661t2 * 0.666

  static p66t21t3 = (3 * (1 - 0.666) * DDeiUtil.p66t2)

  static cacheTextCharSize: Map<string, object> = new Map()


  static PI2 = Math.PI * 2

  /**
   * 记录鼠标位置
   * @param offsetX 
   * @param offsetY 
   * @param screenX 
   * @param screenY 
   */
  static setMousePosition(offsetX: number, offsetY: number, screenX: number, screenY: number): void {
    DDeiUtil.offsetX = offsetX
    DDeiUtil.offsetY = offsetY
    DDeiUtil.screenX = screenX
    DDeiUtil.screenY = screenY
  }

  /**
   * 计算文字的高度和宽度
   */
  static measureTextSize(ddInstance, text, fontFamily, fontSize): object {
    let canvas = ddInstance.render.getCanvas()
    //获得 2d 上下文对象
    let ctx = canvas.getContext('2d');
    ctx.save()
    ctx.font = fontSize + "px " + fontFamily;
    let textArray = text.split('\n');
    let maxWidth = 0;
    let height = textArray.length * fontSize
    textArray.forEach(t => {
      let width = ctx.measureText(t).width;
      if (width > maxWidth) {
        maxWidth = width
      }
    });


    ctx.restore();
    return { width: maxWidth, height: height }
  }

  /**
   * 计算文字的高度和宽度
   */
  static measureText(text: string, font, ctx): object {

    let key = text + "_" + font
    if (!DDeiUtil.cacheTextCharSize.has(key)) {
      //特殊字体
      ctx.font = font;
      let rect = ctx.measureText(text);
      DDeiUtil.cacheTextCharSize.set(key, { width: rect.width, height: ctx.fontSize })
    }
    return DDeiUtil.cacheTextCharSize.get(key);
  }

  /**
   * 将一组控件按照从上到下从左到右的顺序进行排序，返回新的顺序
   * @param element 
   */
  static getSortedModels(models: Map<string, DDeiAbstractShape> | Array<DDeiAbstractShape>): Array<any> {
    let returnArray = new Array()
    if (models) {
      let modelArray = null;
      if (models.set) {
        modelArray = Array.from(models.values());
      } else {
        modelArray = models;
      }
      modelArray.forEach(model => {
        let insert = false;
        for (let i = returnArray.length - 1; i > 0; i--) {
          let rm = returnArray[i];
          if (rm.y <= model.y) {
            returnArray.splice(i + 1, 0, model);
            insert = true
            break;
          } else if (rm.y == model.y && rm.x <= model.x) {
            returnArray.splice(i + 1, 0, model);
            insert = true
            break;
          }
        }
        if (!insert) {
          returnArray.splice(0, 0, model);
        }
      })
    }
    return returnArray
  }

  /**
   * 获取影子图形
   * @param model 
   */
  static getShadowControl(model: DDeiAbstractShape): DDeiAbstractShape {
    let md = null;
    if (model?.baseModelType == "DDeiTable") {
      md = DDeiUtil.cloneModel(model, true);
      md.id = md.id + "_shadow"
      let rows: DDeiTableCell[][] = [];
      let cols: DDeiTableCell[][] = [];
      for (let i = 0; i < model.rows.length; i++) {
        let rowObj = model.rows[i];
        for (let j = 0; j < rowObj.length; j++) {
          let smi = rowObj[j];
          let sm = DDeiUtil.getShadowControl(smi)
          sm.pModel = md;
          if (!rows[sm.row]) {
            rows[sm.row] = []
          }
          rows[sm.row][sm.col] = sm;
          if (!cols[sm.col]) {
            cols[sm.col] = []
          }
          cols[sm.col][sm.row] = sm;

        }
      }
      md.rows = rows;
      md.cols = cols;
      md.initRender();
    } else {
      md = DDeiUtil.cloneModel(model, true);
      md.initRender();
      //将当前操作控件加入临时选择控件
      md.id = md.id + "_shadow"
      if (md?.baseModelType == "DDeiContainer") {
        let newModels = new Map();
        md.models.forEach(smi => {
          let sm = DDeiUtil.getShadowControl(smi)
          sm.id = sm.id.substring(0, sm.id.lastIndexOf("_shadow"))
          sm.pModel = md;
          newModels.set(sm.id, sm)
          sm.initRender();
        });
        md.models = newModels;
      }

    }
    return md;
  }

  //克隆模型，只克隆关键属性
  static cloneModel(sourceModel: DDeiAbstractShape, isShadowClone = false): DDeiAbstractShape {
    if (!sourceModel) {
      return;
    }
    let returnModel = clone(sourceModel);
    if (isShadowClone) {
      returnModel.clps = []
      returnModel.isShadowControl = true

    }
    if (returnModel.layoutManager) {
      returnModel.layoutManager = clone(sourceModel.layoutManager)
      returnModel.layoutManager.container = returnModel
    }
    returnModel.pvs = []
    sourceModel.pvs.forEach(pv => {
      returnModel.pvs.push(clone(pv));
    });
    returnModel.textArea = []
    sourceModel.textArea?.forEach(pv => {
      returnModel.textArea.push(clone(pv));
    });
    returnModel.exPvs = {}
    for (let i in sourceModel.exPvs) {
      returnModel.exPvs[i] = clone(sourceModel.exPvs[i])
    }
    returnModel.cpv = clone(sourceModel.cpv)
    returnModel.bpv = clone(sourceModel.bpv)
    returnModel.ovs = cloneDeep(sourceModel.ovs)
    if (sourceModel.composes?.length > 0) {
      let composes = []
      sourceModel.composes?.forEach(com => {
        let comp = DDeiUtil.cloneModel(com)
        comp.pModel = returnModel
        composes.push(comp)
      });
      returnModel.composes = composes;
    }
    returnModel.unicode = DDeiUtil.getUniqueCode()
    returnModel.initPVS()
    return returnModel;
  }

  /**
   * 返回某个点旋转后的坐标
   */
  static getRotatedPoint(point: object, rotate: number = 0): object {
    let vc = new Vector3(point.x, point.y, point.z || point.z == 0 ? point.z : 1);
    if (rotate) {
      let angle = (-rotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
      let rotateMatrix = new Matrix3(
        Math.cos(angle), Math.sin(angle), 0,
        -Math.sin(angle), Math.cos(angle), 0,
        0, 0, 1);
      vc.applyMatrix3(rotateMatrix)
    }
    return vc
  }

  /**
   * 返回dom绝对坐标
   * @param element 
   */
  static getDomAbsPosition(element): object {
    //计算x坐标
    var actualLeft = element.offsetLeft;
    var current = element.offsetParent;
    while (current !== null) {
      actualLeft += current.offsetLeft;
      current = current.offsetParent;
    }
    //计算y坐标
    var actualTop = element.offsetTop;
    var current = element.offsetParent;
    while (current !== null) {
      actualTop += (current.offsetTop + current.clientTop);
      current = current.offsetParent;
    }
    //返回结果
    return { left: actualLeft, top: actualTop }
  }

  /**
   * 设置样式属性，自动创建不存在的层级
   * @param model 模型
   * @param paths 样式路径,支持传入多个
   * @param value 值
   */
  static setStyle(model: DDeiAbstractShape, paths: string[] | string, value: object): void {
    if (model) {
      let pathArray: string[];
      if (typeof (paths) == 'string') {
        pathArray = [paths];
      } else {
        pathArray = paths;
      }
      pathArray.forEach(path => {
        if (path != '') {
          let attrPaths: string[] = path.split('.');
          let curObj = model;
          for (let i = 0; i < attrPaths.length; i++) {
            if (i != attrPaths.length - 1) {
              if (!curObj[attrPaths[i]]) {
                curObj[attrPaths[i]] = {};
              }
              curObj = curObj[attrPaths[i]];
            } else {
              curObj[attrPaths[i]] = value;
            }
          }
        }
      });
    }
  }

  /**
   * 根据Path获取JSON的数据
   * 如果data路径中存在override，则强制覆盖不从上级获取
   */
  static getDataByPathList(data: object, ...paths: string): object | null {
    if (data && paths) {
      for (let ix = 0; ix < paths.length; ix++) {
        if (paths[ix]) {
          let obj = paths[ix];
          let pathArray = null;
          if (typeof (obj) == "string") {
            pathArray = paths[ix].split(".");
            try {

              let returnJSON = DDeiUtil.getDataByPath(data, pathArray);
              if (returnJSON?.data || returnJSON?.data == 0) {
                return returnJSON.data;
              }
            } catch (e) { }
          } else if (Array.isArray(obj)) {
            if (obj.length > 0) {
              for (let jx = 0; jx < obj.length; jx++) {
                pathArray = obj[jx].split(".");
                try {
                  let returnJSON = DDeiUtil.getDataByPath(data, pathArray);
                  if (returnJSON?.data || returnJSON?.data == 0) {
                    return returnJSON.data;
                  }
                } catch (e) { }
              }
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * 根据配置定义，设置属性值
   * @param model 模型
   * @param paths 属性路径,支持传入多个
   * @param value值
   * @return 由构成的属性的实际路径和配置中对应的值组成的Map
   */
  static setAttrValueByPath(model: object, paths: string[] | string, value: any): void {
    if (model && paths) {
      let attrPaths = null;
      if (typeof (paths) == 'string') {
        attrPaths = paths.split(",");
      } else {
        attrPaths = paths;
      }

      for (let i = 0; i < attrPaths.length; i++) {
        let attCode = attrPaths[i];
        let attrCodePaths = attCode.split(".");
        let currentObj = model;
        for (let j = 0; j < attrCodePaths.length; j++) {
          //最后一个元素，直接设置值，无需创建中间json
          let code = attrCodePaths[j];
          if (j == attrCodePaths.length - 1) {
            currentObj[code] = value;
          } else {
            if (!currentObj[code]) {
              currentObj[code] = {};
            }
            currentObj = currentObj[code];
          }
        }
      }
    }
  }

  /**
   * 声称唯一编码
   * @returns 
   */
  static getUniqueCode() {
    let data = new Date().getTime();
    if (window.performance && typeof window.performance.now === "function") {
      data += performance.now();
    }
    // #endif
    let codeId = 'xxxxxxxxxxxx6xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (msg) {
      let rand = (data + Math.random() * 16) % 16 | 0;
      data = Math.floor(data / 16);
      return (msg == 'x' ? rand : (rand & 0x3 | 0x8)).toString(16);
    });
    return codeId;
  }

  /**
   * 求两点距离
   */
  static getPointDistance(x0: number, y0: number, x1: number, y1: number): number {
    return Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2)
  }

  /**
   * 判断点是否在线上
   */
  static isPointInLine(q, p1, p2): boolean {
    if (!p1 || !p2 || !q) {
      return false;
    }
    let x0 = q.x;
    let y0 = q.y;
    //判断鼠标是否在某个控件的范围内
    //点到直线的距离
    let plLength = Infinity;
    let x1 = p1.x;
    let y1 = p1.y;
    let x2 = p2.x;
    let y2 = p2.y;
    //获取控件所有向量
    if (x1 == x2 && y1 == y2) {
      plLength = DDeiUtil.getPointDistance(x0, y0, x1, y1)
    } else {
      //根据向量外积计算面积
      let s = (x0 - x1) * (y2 - y1) - (y0 - y1) * (x2 - x1)
      //计算直线上两点之间的距离
      let d = DDeiUtil.getPointDistance(x0, y0, x1, y1)
      plLength = s / d
    }
    if (Math.abs(plLength) <= 1) {
      return true;
    }
  }

  /**
   * 获取移动路径
   */
  static getMovePath(sAngle, eAngle, startPoint, endPoint): string {
    let movePath = ""
    //开始点为左边线的各种情况
    switch (sAngle) {
      case 0: {
        switch (eAngle) {
          case 180: {
            //Y相等
            if (Math.abs(startPoint.y - endPoint.y) <= 1) {
              if (startPoint.x > endPoint.x) {
                movePath = "x:0.25,y:-0.25,x:-1.5,y:0.25"
              }
            }
            //开始高于结束
            else if (startPoint.y > endPoint.y) {
              if (startPoint.x > endPoint.x) {
                movePath = "x:0.25,y:-0.5,x:-1.5,y:-0.5"
              }
              else {
                movePath = "x:0.5,y:-1"
              }
            }
            //结束高于开始
            else {
              if (startPoint.x > endPoint.x) {
                movePath = "x:0.25,y:0.5,x:-1.5,y:0.5"
              }
              else {
                movePath = "x:0.5,y:1"
              }
            }
          } break;
          case -90: {
            //Y相等
            if (Math.abs(startPoint.y - endPoint.y) <= 1) {
              if (startPoint.x > endPoint.x) {
                movePath = "x:0.25,y:-0.25,x:-1.25"
              }
            }
            //开始高于结束
            else if (startPoint.y > endPoint.y) {
              if (startPoint.x > endPoint.x) {
                movePath = "x:0.25,y:-1.25,x:-1.25"
              }
              else {
                movePath = "x:0.5,y:-1.25,x:0.5"
              }
            }
            //结束高于开始
            else {
              if (startPoint.x > endPoint.x) {
                movePath = "x:0.25,y:0.5,x:-1.25"
              }
              else {
                movePath = "x:1"
              }
            }
          } break;
          case 90: {
            //Y相等
            if (Math.abs(startPoint.y - endPoint.y) <= 1) {
              if (startPoint.x > endPoint.x) {
                movePath = "x:0.25,y:0.25,x:-1.25,y:-0.25"
              }
            }
            //开始高于结束
            else if (startPoint.y > endPoint.y) {
              if (startPoint.x > endPoint.x) {
                movePath = "x:0.25,y:-0.5,x:-1.25"
              }
              else {
                movePath = "x:1"
              }
            }
            //结束高于开始
            else {
              if (startPoint.x > endPoint.x) {
                movePath = "x:0.25,y:1.25,x:-1.25"
              }
              else {
                movePath = "x:0.5,y:1.25,x:0.5"
              }
            }
          }
            break;
          case 0: {
            //Y相等
            if (Math.abs(startPoint.y - endPoint.y) <= 1) {
              movePath = "x:0.25,y:0.25,x:-1.25,y:-0.25"
            }
            //开始高于结束
            else if (startPoint.y > endPoint.y) {
              if (Math.abs(startPoint.x - endPoint.x) <= 1) {
                movePath = "x:0.25,y:-1"
              }
              else if (startPoint.x > endPoint.x) {
                movePath = "x:0.25,y:-1"
              }
              else {
                movePath = "x:1.25,y:-1"
              }
            }
            //结束高于开始
            else {
              if (Math.abs(startPoint.x - endPoint.x) <= 1) {
                movePath = "x:0.25,y:1"
              }
              else if (startPoint.x > endPoint.x) {
                movePath = "x:0.25,y:1"
              }
              else {
                movePath = "x:1.25,y:1"
              }
            }
          } break;
        }
      } break;
      case 180: {
        switch (eAngle) {
          //开始点为右边线的各种情况
          case 0: {
            //Y相等
            if (Math.abs(startPoint.y - endPoint.y) <= 1) {
              if (startPoint.x > endPoint.x) {
                movePath = ""
              }
              else {
                movePath = "x:-0.25,y:-0.25,x:1.5,y:0.25"
              }
            }
            //开始高于结束
            else if (startPoint.y > endPoint.y) {
              if (startPoint.x > endPoint.x) {
                movePath = "x:-0.25,y:-1"
              }
              else {
                movePath = "x:-0.25,y:-0.5,x:1.5,y:-0.5"
              }
            }
            //结束高于开始
            else {
              if (startPoint.x > endPoint.x) {
                movePath = "x:-0.25,y:1"
              }
              else {
                movePath = "x:-0.25,y:0.5,x:1.5,y:0.5"
              }
            }
          }
            break;
          case -90: {
            //Y相等
            if (Math.abs(startPoint.y - endPoint.y) <= 1) {
              if (startPoint.x < endPoint.x) {
                movePath = "x:-0.25,y:-0.25,x:1.25,y:0.25"
              }
            }
            //开始高于结束
            else if (startPoint.y > endPoint.y) {
              if (startPoint.x > endPoint.x) {
                movePath = "x:-0.5,y:-1.25,x:-0.5"
              }
              else {
                movePath = "x:-0.25,y:-1.25,x:1.25"
              }
            }
            //结束高于开始
            else {
              if (startPoint.x > endPoint.x) {
                movePath = "x:-1"
              }
              else {
                movePath = "x:-0.25,y:0.5,x:1.25"
              }
            }
          }
            break;
          case 90: {
            //Y相等
            if (Math.abs(startPoint.y - endPoint.y) <= 1) {
              if (startPoint.x < endPoint.x) {
                movePath = "x:-0.25,y:0.25,x:1.25"
              }
            }
            //开始高于结束
            else if (startPoint.y > endPoint.y) {
              if (Math.abs(startPoint.x - endPoint.x) <= 1) {
              } else if (startPoint.x > endPoint.x) {
                movePath = "x:-1"
              }
              else {
                movePath = "x:-0.25,y:-0.5,x:1.25"
              }
            }
            //结束高于开始
            else {
              if (startPoint.x > endPoint.x) {
                movePath = "x:-0.5,y:1.25,x:-0.5"
              }
              else {
                movePath = "x:-0.5,y:1.25,x:1.5"
              }
            }
          } break;
          case 180: {
            //Y相等
            if (Math.abs(startPoint.y - endPoint.y) <= 1) {
              if (startPoint.x > endPoint.x) {
                movePath = "x:-0.25,y:-0.25,x:-1,y:0.25"
              } else {
                movePath = "x:-0.25,y:-0.25,x:1,y:0.25"
              }

            }
            //开始高于结束
            else if (startPoint.y > endPoint.y) {
              if (Math.abs(startPoint.x - endPoint.x) <= 1) {
                movePath = "x:-0.25,y:-1"
              }
              else if (startPoint.x > endPoint.x) {
                movePath = "x:-1.25,y:-1"
              }
              else {
                movePath = "x:-0.25,y:-1"
              }
            }
            //结束高于开始
            else {
              if (Math.abs(startPoint.x - endPoint.x) <= 1) {
                movePath = "x:-0.25,y:1"
              }
              else if (startPoint.x > endPoint.x) {
                movePath = "x:-1.25,y:1"
              }
              else {
                movePath = "x:-0.25,y:1"
              }
            }
          } break;
        }
      } break;

      case -90: {
        switch (eAngle) {
          //开始点为上边线的各种情况
          case 90: {
            //Y相等
            if (Math.abs(startPoint.y - endPoint.y) <= 1) {
            }
            //开始高于结束
            else if (startPoint.y > endPoint.y) {
              if (Math.abs(startPoint.x - endPoint.x) <= 1) {

              } else if (startPoint.x > endPoint.x) {
                movePath = "y:-0.5,x:-1"
              }
              else {
                movePath = "y:-0.5,x:1"
              }
            }
            //结束高于开始
            else {
              if (Math.abs(startPoint.x - endPoint.x) <= 1) {
                movePath = "y:-0.25,x:-0.5,y:1.5,x:-0.5"
              }
              else if (startPoint.x > endPoint.x) {
                movePath = "y:-0.25,x:-0.5,y:1.5,x:-0.5"
              }
              else {
                movePath = "y:-0.25,x:0.5,y:1.5,x:0.5"
              }
            }
          }
            break;
          case 0: {
            //Y相等
            if (Math.abs(startPoint.y - endPoint.y) <= 1) {
              if (startPoint.x < endPoint.x) {
                movePath = "y:-0.5,x:1.25,y:0.5"
              }
            }
            //开始高于结束
            else if (startPoint.y > endPoint.y) {
              if (Math.abs(startPoint.x - endPoint.x) <= 1) {

              } else if (startPoint.x > endPoint.x) {
                movePath = "y:-1"
              }
              else {
                movePath = "y:-0.5,x:1.25,y:-0.5"
              }
            }
            //结束高于开始
            else {
              if (Math.abs(startPoint.x - endPoint.x) <= 1) {
                movePath = "y:-0.25,x:0.5,y:1.25"
              }
              else if (startPoint.x > endPoint.x) {
                movePath = "y:-0.25,x:-0.5,y:1.25"
              }
              else {
                movePath = "y:-0.25,x:1.25,y:1.25"
              }
            }
          }
            break;
          case 180: {
            //Y相等
            if (Math.abs(startPoint.y - endPoint.y) <= 1) {
              if (startPoint.x > endPoint.x) {
                movePath = "y:-0.5,x:-1.25,y:0.5"
              }
            }
            //开始高于结束
            else if (startPoint.y > endPoint.y) {
              if (Math.abs(startPoint.x - endPoint.x) <= 1) {

              } else if (startPoint.x > endPoint.x) {
                movePath = "y:-0.5,x:-1.25,y:-0.5"
              }
              else {
                movePath = "y:-1"
              }
            }
            //结束高于开始
            else {
              if (Math.abs(startPoint.x - endPoint.x) <= 1) {
                movePath = "y:-0.25,x:-0.5,y:1.25"
              }
              else if (startPoint.x > endPoint.x) {
                movePath = "y:-0.25,x:-1.25,y:1.25"
              }
              else {
                movePath = "y:-0.25,x:0.5,y:1.25"
              }
            }
          }
            break;
          case -90: {
            //Y相等
            if (Math.abs(startPoint.y - endPoint.y) <= 1) {
              if (startPoint.x > endPoint.x) {
                movePath = "y:-0.25,x:-1"
              }
              else {
                movePath = "y:-0.25,x:1"
              }
            }
            //开始高于结束
            else if (startPoint.y > endPoint.y) {
              if (Math.abs(startPoint.x - endPoint.x) <= 1) {
                movePath = "y:-0.25,x:-0.5,y:-1,x:0.5"
              } else if (startPoint.x > endPoint.x) {
                movePath = "y:-1.25,x:-1"
              }
              else {
                movePath = "y:-1.25,x:1"
              }
            }
            //结束高于开始
            else {
              if (Math.abs(startPoint.x - endPoint.x) <= 1) {
                movePath = "y:-0.25,x:-0.5,y:1.25,x:0.5"
              }
              else if (startPoint.x > endPoint.x) {
                movePath = "y:-0.25,x:-1"
              }
              else {
                movePath = "y:-0.25,x:1"
              }
            }
          }
            break;
        }
      } break;
      case 90: {
        switch (eAngle) {
          //开始点为下边线的各种情况
          case -90: {
            //Y相等
            if (Math.abs(startPoint.y - endPoint.y) <= 1) {
            }
            //开始高于结束
            else if (startPoint.y > endPoint.y) {
              if (Math.abs(startPoint.x - endPoint.x) <= 1) {
                movePath = "y:0.25,x:0.5,y:-1.5,x:-0.5"
              } else if (startPoint.x > endPoint.x) {
                movePath = "y:0.25,x:-0.5,y:-1.5,x:-0.5"
              }
              else {
                movePath = "y:0.25,x:0.5,y:-1.5,x:0.5"
              }
            }
            //结束高于开始
            else {
              if (Math.abs(startPoint.x - endPoint.x) <= 1) {

              }
              else if (startPoint.x > endPoint.x) {
                movePath = "y:0.5,x:-1"
              }
              else {
                movePath = "y:0.5,x:1"
              }
            }
          } break;
          case 0: {
            //Y相等
            if (Math.abs(startPoint.y - endPoint.y) <= 1) {
              if (startPoint.x < endPoint.x) {
                movePath = "y:0.5,x:1.25,y:-0.5"
              }
            }
            //开始高于结束
            else if (startPoint.y > endPoint.y) {
              if (Math.abs(startPoint.x - endPoint.x) <= 1) {
              } else if (startPoint.x > endPoint.x) {
                movePath = "y:0.25,x:-0.5,y:-1.25"
              }
              else {
                movePath = "y:0.25,x:1.25,y:-1.25"
              }
            }
            //结束高于开始
            else {
              if (Math.abs(startPoint.x - endPoint.x) <= 1) {

              }
              else if (startPoint.x > endPoint.x) {
                movePath = "y:1"
              }
              else {
                movePath = "y:0.5,x:1.25,y:0.5"
              }
            }
          } break;
          case 180: {
            //Y相等
            if (Math.abs(startPoint.y - endPoint.y) <= 1) {
              if (startPoint.x > endPoint.x) {
                movePath = "y:0.5,x:-1.25,y:-0.5"
              }
            }
            //开始高于结束
            else if (startPoint.y > endPoint.y) {
              if (Math.abs(startPoint.x - endPoint.x) <= 1) {
              } else if (startPoint.x > endPoint.x) {
                movePath = "y:0.25,x:-1.25,y:-1.25"
              }
              else {
                movePath = "y:0.25,x:0.5,y:-1.25"
              }
            }
            //结束高于开始
            else {
              if (Math.abs(startPoint.x - endPoint.x) <= 1) {

              }
              else if (startPoint.x > endPoint.x) {
                movePath = "y:0.5,x:-1.25,y:0.5"
              }
              else {
                movePath = "y:1"
              }
            }
          } break;
          case 90: {
            //Y相等
            if (Math.abs(startPoint.y - endPoint.y) <= 1) {

            }
            //开始高于结束
            else if (startPoint.y > endPoint.y) {
              if (Math.abs(startPoint.x - endPoint.x) <= 1) {
                movePath = "y:0.25,x:-0.5,y:-1,x:0.5"
              } else if (startPoint.x > endPoint.x) {
                movePath = "y:0.25,x:-1"
              }
              else {
                movePath = "y:0.25,x:1"
              }
            }
            //结束高于开始
            else {
              if (Math.abs(startPoint.x - endPoint.x) <= 1) {
                movePath = "y:0.25,x:0.5,y:1,x:-0.5"
              }
              else if (startPoint.x > endPoint.x) {
                movePath = "y:1.25,x:-1"
              }
              else {
                movePath = "y:1.25,x:1"
              }
            }
          } break;
        }
      } break;
    }

    return movePath;
  }

  /**
   * 判断两条线段是否相交
   * @param l1 线段1
   * @param l2 线段2
   * @returns 
   */
  static isLineCross(l1: { x1: number, y1: number, x2: number, y2: number }, l2: { x1: number, y1: number, x2: number, y2: number }): boolean {
    //快速排斥实验
    if ((l1.x1 > l1.x2 ? l1.x1 : l1.x2) < (l2.x1 < l2.x2 ? l2.x1 : l2.x2) ||
      (l1.y1 > l1.y2 ? l1.y1 : l1.y2) < (l2.y1 < l2.y2 ? l2.y1 : l2.y2) ||
      (l2.x1 > l2.x2 ? l2.x1 : l2.x2) < (l1.x1 < l1.x2 ? l1.x1 : l1.x2) ||
      (l2.y1 > l2.y2 ? l2.y1 : l2.y2) < (l1.y1 < l1.y2 ? l1.y1 : l1.y2)) {
      return false;
    }
    //跨立实验
    if ((((l1.x1 - l2.x1) * (l2.y2 - l2.y1) - (l1.y1 - l2.y1) * (l2.x2 - l2.x1)) *
      ((l1.x2 - l2.x1) * (l2.y2 - l2.y1) - (l1.y2 - l2.y1) * (l2.x2 - l2.x1))) > 0 ||
      (((l2.x1 - l1.x1) * (l1.y2 - l1.y1) - (l2.y1 - l1.y1) * (l1.x2 - l1.x1)) *
        ((l2.x2 - l1.x1) * (l1.y2 - l1.y1) - (l2.y2 - l1.y1) * (l1.x2 - l1.x1))) > 0) {
      return false;
    }
    return true;
  }

  /**
   * 取得两条线相交的点
   * @param p1 线1点1
   * @param p2 线1点2
   * @param p3 线2点1
   * @param p4 线2点2
   * @returns 
   */
  static getLineCorssPoint(p1: { x: number, y: number }, p2: { x: number, y: number }, p3: { x: number, y: number }, p4: { x: number, y: number }) {

    let abc = (p1.x - p3.x) * (p2.y - p3.y) - (p1.y - p3.y) * (p2.x - p3.x);
    let abd = (p1.x - p4.x) * (p2.y - p4.y) - (p1.y - p4.y) * (p2.x - p4.x);
    if (abc * abd >= 0) {
      return null;
    }

    let cda = (p3.x - p1.x) * (p4.y - p1.y) - (p3.y - p1.y) * (p4.x - p1.x);
    let cdb = cda + abc - abd;
    if (cda * cdb >= 0) {
      return null;
    }

    let t = cda / (abd - abc);
    let dx = t * (p2.x - p1.x),
      dy = t * (p2.y - p1.y);
    return { x: p1.x + dx, y: p1.y + dy };

  }

  static isRectCorss(rect1, rect2): boolean {
    let maxX, maxY, minX, minY
    maxX = rect1.x + rect1.width >= rect2.x + rect2.width ? rect1.x + rect1.width : rect2.x + rect2.width
    maxY = rect1.y + rect1.height >= rect2.y + rect2.height ? rect1.y + rect1.height : rect2.y + rect2.height
    minX = rect1.x <= rect2.x ? rect1.x : rect2.x
    minY = rect1.y <= rect2.y ? rect1.y : rect2.y

    if (maxX - minX <= rect1.width + rect2.width && maxY - minY <= rect1.height + rect2.height) {
      return true
    } else {
      return false
    }
  }

  /**
   * 计算线段相对于窗口的角度
   */
  static getLineAngle(x1: number, y1: number, x2: number, y2: number): number {
    //归到原点，求夹角
    x2 -= x1
    y2 -= y1
    let v1 = new Vector3(1, 0, 0)
    let v2 = new Vector3(x2, y2, 0)
    let lineAngle = v1.angleTo(v2) * 180 / Math.PI;
    if (v1.cross(v2).z < 0) {
      lineAngle = -lineAngle
    }
    return lineAngle;
  }

  /**
   * 根据Path获取JSON的数据
   * 如果data路径中存在override，则强制覆盖不从上级获取
   */
  static getDataByPath(data: object, path: string[]): object {
    let returnValue = null;
    let isoverwrite = false;
    if (path && path.length > 0) {
      //属性详情路径code
      let dataJson = data;
      //尝试转为json获取深层次数据
      if (typeof (data) == 'string') {
        dataJson = JSON.parse(data);
      }
      if (dataJson?.overwrite == true) {
        isoverwrite = true
      }
      //获取属性
      for (let i = 0; i < path.length; i++) {
        let p = path[i];
        if (p.indexOf('[') != -1) {
          eval("dataJson = dataJson." + p + ";")
        } else {
          dataJson = dataJson[p];
        }
        if (dataJson?.overwrite == true) {
          isoverwrite = true
        }
      }
      returnValue = dataJson;
    } else {
      returnValue = data;
      if (returnValue?.overwrite == true) {
        isoverwrite = true
      }
    }
    return { data: returnValue, overwrite: isoverwrite }
  }

  /**
   * 获取设备像素比
   */
  static getPixelRatio(context: any): number {
    let backingStore = context.backingStorePixelRatio ||
      context.webkitBackingStorePixelRatio ||
      context.mozBackingStorePixelRatio ||
      context.msBackingStorePixelRatio ||
      context.oBackingStorePixelRatio ||
      context.backingStorePixelRatio || 1;
    return (window.devicePixelRatio || 1) / backingStore;
  }

  /**
   * 将任意单位的长度转换为像素
   * @param number 
   * @param unit 
   */
  static unitToPix(number: number, unit: string, dpi: number): number {
    let unitWeight = 0;
    switch (unit) {
      case 'mm': {
        unitWeight = DDeiUtil.mmToPx(number, dpi);
        break;
      }
      case 'cm': {
        unitWeight = DDeiUtil.cmToPx(number, dpi);
        break;
      }
      case 'm': {
        unitWeight = DDeiUtil.mToPx(number, dpi);
        break;
      }
      case 'inch': {
        unitWeight = DDeiUtil.inchToPx(number, dpi);
        break;
      }
      case 'px': {
        unitWeight = number
        break;
      }
    }
    return unitWeight
  }

  //毫米转像素
  static mmToPx(mm: number, dpi: number): number {
    return mm / 25.4 * dpi
  }

  //厘米转像素
  static cmToPx(cm: number, dpi: number): number {
    return cm / 2.54 * dpi
  }

  //米转像素
  static mToPx(m: number, dpi: number): number {
    return m / 0.0254 * dpi
  }

  //英寸转像素
  static inchToPx(inc: number, dpi: number): number {
    return inc * dpi
  }


  /**
   * 获取屏幕DPI
   */
  static getDPI(): object {
    if (window.screen.deviceXDPI) {
      return { x: window.screen.deviceXDPI, y: window.screen.deviceYDPI }
    }
    else {
      let tmpNode = document.createElement("DIV");
      tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
      document.body.appendChild(tmpNode);
      let x = parseInt(tmpNode.offsetWidth)
      let y = parseInt(tmpNode.offsetHeight)
      tmpNode.parentNode.removeChild(tmpNode);
      return { x: x, y: y }
    }
  }



  // 16进制编码转rgb
  static hex2rgb(hex: string): string {
    let hexNum = hex.substring(1);
    hexNum = '0x' + (hexNum.length < 6 ? repeatLetter(hexNum, 2) : hexNum);
    let r = hexNum >> 16;
    let g = hexNum >> 8 & '0xff';
    let b = hexNum & '0xff';
    return `rgb(${r},${g},${b})`;
  }

  static repeatWord(word: string, num: number): string {
    let result = '';
    for (let i = 0; i < num; i++) {
      result += word;
    }
    return result;
  }

  static repeatLetter(word: string, num: number): String {
    var result = '';
    for (let letter of word) {
      result += repeatWord(letter, num);
    }
    return result;
  }


  // rgb转16进制
  static rgb2hex(color: string): string {
    let rgb = color.split(',');
    let r = parseInt(rgb[0].split('(')[1]);
    let g = parseInt(rgb[1]);
    let b = parseInt(rgb[2].split(')')[0]);
    let hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return hex;
  }

  // 将颜色转换为可用颜色(rgb),其他情况原样返回
  static getColor(color: string): string {
    if (!color) {
      return null;
    }
    if (color.startsWith("#")) {
      return this.hex2rgb(color);
    }
    //其余情况原样返回
    else {
      return color;
    }
  }

  /**
   * 四舍五入保留小数
   * @param number 原始数字
   * @param pos 小数位数
   */
  static round(number: number, pos: number = 0): number {
    let n = number.toFixed(pos)
    return parseFloat(n);
  }

  /**
   * 将N个点，归0坐标
   */
  static pointsToZero(points: Vector3[], cpv: Vector3, rotate: number): [] {
    if (points?.length > 0 && cpv) {
      let toZeroMatrix = new Matrix3(
        1, 0, -cpv.x,
        0, 1, -cpv.y,
        0, 0, 1);
      if (rotate) {
        let angle = (rotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
        let rotateMatrix = new Matrix3(
          Math.cos(angle), Math.sin(angle), 0,
          -Math.sin(angle), Math.cos(angle), 0,
          0, 0, 1);
        toZeroMatrix.premultiply(rotateMatrix)
      }
      let returnPoints = []
      points.forEach(pv => {
        let npv = new Vector3()
        for (let i in pv) {
          npv[i] = pv[i]
        }
        npv.z = (pv.z || pv.z === 0) ? pv.z : 1
        npv.applyMatrix3(toZeroMatrix)
        returnPoints.push(npv)
      })
      return returnPoints;
    }
    return []
  }

  /**
   * 将N个归0点，放回坐标
   */
  static zeroToPoints(points: Vector3[], cpv: Vector3, rotate: number, scaleX = 1, scaleY = 1): [] {
    if (points?.length > 0 && cpv) {
      let m1 = new Matrix3(
        1, 0, 0,
        0, 1, 0,
        0, 0, 1);
      if (scaleX != 1 || scaleY != 1) {
        let scaleMatrix = new Matrix3(
          scaleX, 0, 0,
          0, scaleY, 0,
          0, 0, 1);
        m1.premultiply(scaleMatrix)
      }
      if (rotate) {
        let angle = (-rotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
        let rotateMatrix = new Matrix3(
          Math.cos(angle), Math.sin(angle), 0,
          -Math.sin(angle), Math.cos(angle), 0,
          0, 0, 1);
        m1.premultiply(rotateMatrix)
      }
      let moveMatrix = new Matrix3(
        1, 0, cpv.x,
        0, 1, cpv.y,
        0, 0, 1);
      m1.premultiply(moveMatrix)
      let returnPoints = []
      points.forEach(pv => {
        let npv = new Vector3()
        for (let i in pv) {
          npv[i] = pv[i]
        }
        npv.z = (pv.z || pv.z === 0) ? pv.z : 1
        npv.applyMatrix3(m1)
        returnPoints.push(npv)
      })
      return returnPoints;
    }
    return []
  }


  /**
   * 根据类别获取OVS
   * @param ovs 
   * @param type 
   * @returns 
   */
  static getOVSByType(model, type: number) {
    if (!type) {
      return model.ovs
    }
    let returnOVS = []
    let ovds = DDeiUtil.getControlDefine(model)?.define?.ovs;
    for (let i = 0; i < model?.ovs?.length; i++) {
      let ov = model.ovs[i]
      let ovd = ovds[i]
      if (ovd.type == type) {
        returnOVS.push(ov)
      }
    };
    return returnOVS
  }

  /**
   * 对坐标以及大小进行缩放，并返回新的坐标
   * @param pos 原始位置
   * @param ratio 缩放比率
   * @returns 缩放后的坐标
   */
  static getRatioPosition(pos: object, ratio: number): any {
    if (!pos) {
      return null;
    } else {
      let returnP = {};
      if (pos.x || pos.x == 0) {
        returnP.x = pos.x * ratio;
      }
      if (pos.y || pos.y == 0) {
        returnP.y = pos.y * ratio;
      }
      if (pos.width || pos.width == 0) {
        returnP.width = pos.width * ratio;
      }
      if (pos.height || pos.height == 0) {
        returnP.height = pos.height * ratio;
      }
      return returnP;
    }
  }

  /**
   * 获取不同字体大小的空格所占空间
   */
  static getSpaceWidth(fontFamily: string, fontSize: number, fontStyle: string): number {
    let key = fontFamily + "_" + fontSize + "_" + fontStyle;
    if (!DDeiConfig.SPACE_WIDTH_MAP[key]) {
      if ("Arial Unicode" == fontFamily) {
        let spaceWidth = fontSize * 0.21 / 0.75;
        DDeiConfig.SPACE_WIDTH_MAP[key] = spaceWidth;
      } else if ("STSong-Light" == fontFamily) {
        let spaceWidth = fontSize * 0.21;
        DDeiConfig.SPACE_WIDTH_MAP[key] = spaceWidth;
      }
    }
    return DDeiConfig.SPACE_WIDTH_MAP[key]
  }

  /**
    * 通过当前P点和旋转角度计算旋转之前的点
    */
  static computePosition(occ: { x: number, y: number }, rcc: { x: number, y: number }, angle: number): { x: number, y: number } {
    // 圆心
    let a: number = occ.x;
    let b: number = occ.y;
    // 计算
    let c: number = (Math.PI / 180 * angle).toFixed(4);
    let rx: number = ((rcc.x - a) * Math.cos(c) - (rcc.y - b) * Math.sin(c) + a).toFixed(4);
    let ry: number = ((rcc.y - b) * Math.cos(c) + (rcc.x - a) * Math.sin(c) + b).toFixed(4);
    // 取整
    // rx = Math.round(rx);
    // ry = Math.round(ry);
    return { x: rx, y: ry };
  }

  /**
   * 时间格式化
   * @param date 
   * @param fmt 
   * @returns 
   */
  static formatDate(date, fmt): string {
    let o = {
      "M+": date.getMonth() + 1, //月份 
      "d+": date.getDate(), //日 
      "h+": date.getHours(), //小时 
      "m+": date.getMinutes(), //分 
      "s+": date.getSeconds() //秒 
    };
    if (ytestReg.test(fmt)) { //根据y的长度来截取年
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (let k in o) {
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
    return fmt;
  }

  /**
   * 复制属性值，再将最终的结果返回，如果目标不存在属性，则动态创建
   * @param source 源
   * @param dist 目标
   */
  static copyJSONValue(source, dist): object {
    let distType = typeof dist;
    let sourceType = typeof source;
    let type = distType && distType != 'undefined' ? distType : sourceType;
    if (type != undefined && type != undefined) {
      switch (type) {
        case "string": return source;
        case "number": return source;
        case "bigint": return source;
        case "boolean": return source;
        case "function": return source;
        case "object": {
          if (!dist) {
            dist = {}
          }
          for (let i in source) {
            dist[i] = DDeiUtil.copyJSONValue(source[i], dist[i])
          }
          return dist;
        }
      }
    }
    return null;
  }

  /**
   * 判断是否具备某种权限
   * @operate 操作
   * @control 控件
   * @propName 属性
   * @mode 模式
   */
  static isAccess(operate: string, control: DDeiAbstractShape, propName: string, mode: string, ddInstance: DDei): boolean {
    //按照优先级获取属性权限值，如果获取不到，默认返回true
    let strkey = "AC_" + mode + "_" + operate
    if (control) {
      if (propName) {
        //控件ID
        let accessValue = DDeiUtil.getConfigValue(strkey + "_" + control.id + "_" + propName, ddInstance)
        if (accessValue || accessValue == false) {
          return accessValue;
        } else {
          if (control.code) {
            accessValue = DDeiUtil.getConfigValue(strkey + "_" + control.code + "_" + propName, ddInstance)
          }
          if (accessValue || accessValue == false) {
            return accessValue;
          } else {
            if (control.modelCode) {
              accessValue = DDeiUtil.getConfigValue(strkey + "_" + control.modelCode + "_" + propName, ddInstance)
            }
            if (accessValue || accessValue == false) {
              return accessValue;
            } else {
              if (control.modelType) {
                accessValue = DDeiUtil.getConfigValue(strkey + "_" + control.modelType + "_" + propName, ddInstance)
              }
              if (accessValue || accessValue == false) {
                return accessValue;
              }
            }
          }
        }
      }
      //控件ID
      let accessValue = DDeiUtil.getConfigValue(strkey + "_" + control.id, ddInstance)
      if (accessValue || accessValue == false) {
        return accessValue;
      } else {
        if (control.code) {
          accessValue = DDeiUtil.getConfigValue(strkey + "_" + control.code, ddInstance)
        }
        if (accessValue || accessValue == false) {
          return accessValue;
        } else {
          if (control.modelCode) {
            accessValue = DDeiUtil.getConfigValue(strkey + "_" + control.modelCode, ddInstance)
          }
          if (accessValue || accessValue == false) {
            return accessValue;
          } else {
            if (control.modelType) {
              accessValue = DDeiUtil.getConfigValue(strkey + "_" + control.modelType, ddInstance)
            }
            if (accessValue || accessValue == false) {
              return accessValue;
            }
          }
        }
      }
    }
    let accessValue = DDeiUtil.getConfigValue(strkey, ddInstance)
    if (accessValue || accessValue == false) {
      return accessValue;
    }
    return true;
  }

  /**
   * 获取配置属性值
   * @param key key
   */
  static getConfigValue(key: string, ddInstance: DDei) {
    if (ddInstance && (ddInstance[key] || ddInstance[key] == false || ddInstance[key] == 0)) {
      return ddInstance[key];
    } else {
      return DDeiConfig[key];
    }
  }

  /**
   *@param num：格式化目标数字
   *@param decimal：保留几位小数，默认2位
   *@param split：千分位分隔符，默认为空
  */
  static formatNumber(num, decimal = 0, split = ''): string {
    if (num != null && num != undefined && isFinite(num)) {
      let res = ''
      let dotIndex = String(num).indexOf('.')
      if (dotIndex === -1) { // 整数
        if (decimal === 0) {
          res = String(num).replace(/(\d)(?=(?:\d{3})+$)/g, `$1${split}`)
        } else {
          res = String(num).replace(/(\d)(?=(?:\d{3})+$)/g, `$1${split}`) + '.' + '0'.repeat(decimal)
        }
      } else {
        let numStr = String((Math.round(num * Math.pow(10, decimal)) / Math.pow(10, decimal)).toFixed(decimal)) // 四舍五入，然后固定保留2位小数
        let decimals = numStr.slice(dotIndex, dotIndex + decimal + 1) // 截取小数位
        res = String(numStr.slice(0, dotIndex)).replace(/(\d)(?=(?:\d{3})+$)/g, `$1${split}`) + decimals
      }
      return res
    } else {
      return num
    }
  }


  /**
   * 是否为safari浏览器
   */
  static isSafari(): boolean {
    // 判断是否Safari浏览器
    return safariReg.test(navigator.userAgent) && !chromeReg.test(navigator.userAgent)  // 是Safari为true，
  }
  /**
     * 获取可替换的数据值
     * 主要用于得到经过业务替换值绑定后的数据
     * @param model 对象
     * @param keypath  属性路径，一般用.隔开
     * @param format 是否需要格式化
     * @param replaceSPT 是否替换特殊样式
     */
  static getReplacibleValue(model: object, keypath: string, format: boolean = false, replaceSPT: boolean = false): any {
    //获取原始值
    if (model) {
      let hasTempSpt = false;
      let replaceDetail = null;
      let originValue = model?.render?.getCachedValue(keypath);
      let returnValue = originValue;
      //执行值绑定替换
      if (originValue && originValue.indexOf("#") != -1) {
        //获取外部业务传入值
        let busiData = DDeiUtil.getBusiData();
        if (busiData) {
          let replaceResult = DDeiUtil.expressBindValue(originValue, busiData);
          if (replaceResult?.data) {
            returnValue = replaceResult.data;
            replaceDetail = replaceResult.detail
          }
        }
      }
      //如果开启格式化，套用格式化的替换规则
      let hasFormatted = false;
      if (format) {
        let fmtType = model?.render?.getCachedValue("fmt.type");
        let formatValue = null;
        switch (fmtType) {
          case 1: {
            //数字
            //小数位数
            let scale = model?.render?.getCachedValue("fmt.nscale");
            //千分符
            let tmark = model?.render?.getCachedValue("fmt.tmark");

            formatValue = DDeiUtil.formatNumber(returnValue, !scale || isNaN(scale) ? 0 : scale, tmark == 1 ? ',' : '')
          } break;
          case 2: {
            //人民币大写
            let mrmb = model?.render?.getCachedValue("fmt.mrmb");
            if (mrmb == 1) {
              formatValue = DDeiUtil.toBigMoney(returnValue);
            } else {
              //小数位数
              let scale = model?.render?.getCachedValue("fmt.nscale");
              //千分符
              let tmark = model?.render?.getCachedValue("fmt.tmark");
              //货币单位
              let munit = model?.render?.getCachedValue("fmt.munit");
              //货币符号
              let mmark = model?.render?.getCachedValue("fmt.mmark");
              formatValue = DDeiUtil.formatNumber(returnValue, !scale || isNaN(scale) ? 0 : scale, tmark == 1 ? ',' : '')
              formatValue = (mmark ? mmark : '') + formatValue + (munit ? munit : '')
            }
          } break;
          case 3: {
            //时间类型
            let dtype = model?.render?.getCachedValue("fmt.dtype");
            let isFmt = false
            let dv = null;
            if (isDate(returnValue)) {
              isFmt = true;
              dv = returnValue
            } else if (isString(returnValue) || isNumber(returnValue) && ("" + returnValue).length == 13) {
              try {
                dv = new Date(parseInt(returnValue))
                isFmt = true;
              } catch (e) { }
            }
            if (isFmt) {
              switch (dtype) {
                case 1: {
                  formatValue = DDeiUtil.formatDate(dv, "yyyy-MM-dd")
                } break;
                case 2: {
                  formatValue = DDeiUtil.formatDate(dv, "hh:mm:ss")
                } break;
                case 3: {
                  formatValue = DDeiUtil.formatDate(dv, "yyyy-MM-dd hh:mm:ss")
                } break;
                case 99: {
                  //自定义格式化字符串
                  let format = model?.render?.getCachedValue("fmt.format");
                  if (format) {
                    formatValue = DDeiUtil.formatDate(dv, format)
                  }
                } break;
              }
            }
          } break;
        }
        //如果格式化后的字符与原始字符不一致，则用第一个特殊样式作为全局样式
        if (formatValue) {
          if (returnValue != formatValue && model.render && replaceSPT && model.sptStyle) {
            //复制一份作为临时样式，只替换临时样式，不动原始样式
            let tempSptStyleArr = DDeiUtil.sptStyleToArray(JSON.parse(JSON.stringify(model.sptStyle)));
            let tempStyle = null;
            for (let i = 0; i < tempSptStyleArr.length; i++) {
              let v = tempSptStyleArr[i];
              if (v && JSON.stringify(v) != "{}") {
                tempStyle = v
                break;
              }
            }
            //复制并替换样式
            if (tempStyle) {
              tempSptStyleArr = DDeiUtil.copyElementToArray(tempStyle, formatValue.length)
            }
            if (tempSptStyleArr?.length > 0) {
              model.render.tempSptStyle = DDeiUtil.sptStyleArrayToObject(tempSptStyleArr);
              hasTempSpt = true;
            } else {
              delete model.render.tempSptStyle
            }
          } else {
            delete model.render.tempSptStyle
          }
          returnValue = formatValue;
          hasFormatted = true;
        }
      }

      //未执行格式化的情况下，对开启特殊样式值替换,且存在被替换的字符串
      if (!hasFormatted && model.render && replaceSPT && replaceDetail?.length > 0 && model.sptStyle) {
        //复制一份作为临时样式，只替换临时样式，不动原始样式
        let tempSptStyleArr = DDeiUtil.sptStyleToArray(JSON.parse(JSON.stringify(model.sptStyle)));
        //基于replaceDetail对tempSptStyle进行替换
        let deltaI = 0;

        replaceDetail.forEach(detail => {
          //开始和结束
          let sidx = detail.index
          let eidx = detail.index + detail.bind.length

          //遍历样式，找到样式模板
          let tempStyle = null;
          for (let i = sidx; i < eidx; i++) {
            let v = DDeiUtil.getDataByPathList(model, "sptStyle." + i);
            if (v && JSON.stringify(v) != "{}") {
              tempStyle = v
              break;
            }
          }
          //复制并替换样式
          if (tempStyle) {
            let insertArr = DDeiUtil.copyElementToArray(tempStyle, detail.value.length)
            tempSptStyleArr.splice(sidx + deltaI, (eidx - sidx), ...insertArr);
            deltaI += (detail.value.length - eidx + sidx)
          }
        });
        if (tempSptStyleArr?.length > 0) {
          hasTempSpt = true;
          model.render.tempSptStyle = DDeiUtil.sptStyleArrayToObject(tempSptStyleArr);
        }
      }
      if (!hasTempSpt) {
        delete model.render.tempSptStyle
      }
      return returnValue;
    }
    return null;
  }


  /**
   * 把一个元素复制到一个数组中
   * @param element 
   * @param size 
   */
  static copyElementToArray(element: object, size: number): object[] {
    let arr = []
    if (size > 0) {
      for (let i = 0; i < size; i++) {
        let data = cloneDeep(element);
        arr.push(data)
      }
    }
    return arr
  }

  /**
   * 将sptStyle，按照key的大小转换为数组形式
   * @param sptStyle 
   */
  static sptStyleToArray(sptStyle: object): object[] {
    //先求到最大和最小然后补全
    let max = -Infinity, min = Infinity;
    let arr = []
    for (let i in sptStyle) {
      max = Math.max(max, parseInt(i))
      min = Math.min(min, parseInt(i))
    }
    if (max != -Infinity && min != Infinity) {
      for (let i = 0; i < min; i++) {
        arr.push(null);
      }
      for (let i = min; i <= max; i++) {
        arr.push(sptStyle[i]);
      }
    }
    return arr;
  }

  /**
   * 将sptStyle，按照key的大小转换为数组形式
   * @param sptStyle 
   */
  static sptStyleArrayToObject(sptStyle: object[]): object {
    let obj = {}
    for (let i = 0; i < sptStyle.length; i++) {
      if (sptStyle[i]) {
        obj[i] = sptStyle[i]
      }
    }
    return obj;
  }


  /**
   * 用于处理绑定字段或文本的表达式替换
   * @return 返回替换后的字符串，以及替换的详情信息
   */
  static expressBindValue(originValue, busiData, row): object {
    if (originValue && originValue.indexOf("#{") != -1) {
      let t = originValue;
      let replaceData = "";
      let replaceDetail = []
      let usedCharIdx = 0;
      while (t && t != '') {
        let result = expressBindValueReg.exec(t);
        if (result != null && result.length > 0) {

          replaceData += t.substring(0, result.index);
          let rs = result[0].replaceAll(" ", "");
          let aer = this.analysisExpress(rs.substring(2, rs.length - 1), busiData, row);
          replaceDetail.push({ index: result.index + usedCharIdx, bind: result[0], value: aer })
          replaceData += aer;
          usedCharIdx += result.index + result[0].length
          t = t.substr(result.index + result[0].length);
        } else {
          replaceData += t;
          break;
        }
      }
      return { data: replaceData, detail: replaceDetail };

    }
  }

  /**
   * 处理表达式计算,格式如下：
   * 列表.行#费用 列表的当前行费用
   * 列表.行#费用-列表.行#收入 列表当前行费用-当前行收入
   * 列表.0#费用 第一行的费用字段
   * 列表.数量 列表长度
   * 列表.平均#费用 对列表中的费用字段求平均值
   * 列表.求和#费用 对列表中的费用字段求合
   * 列表.求和#收入-列表#求和#费用 列表中收入-费用
   * 列表.求和#收入-100 列表中收入-100
   */
  static analysisExpress(expressContent, busiData, row) {
    //去掉表达式中的空格
    expressContent = expressContent.replaceAll(" ", "");
    //用正则进行拆分
    let replaceData = expressContent;
    let expressArray = expressContent.split(contentSplitReg);
    if (expressArray != null && expressArray.length > 0) {
      //循环对每一个子项进行求值,并返回替换表达式中的值
      for (let i = 0; i < expressArray.length; i++) {
        let ea = expressArray[i];
        let eaValue = this.calculExpressValue(ea, busiData, row);
        replaceData = replaceData.replaceAll(ea, eaValue);
      }
    }
    try {
      if (contentSplitReg.test(expressContent)) {
        replaceData = replaceData.replaceAll("null", 0);
        replaceData = eval(replaceData);
      } else {
        replaceData = replaceData.replaceAll("null", "");
      }
    } catch (e) {
      console.error(e);
      replaceData = "";
    }
    return replaceData;
  }

  //解析简单的，不带任何运算符号的表达式
  static calculExpressValue(ea, busiData, row) {

    let rd = null;
    //如果是数字则直接返回
    if (isNumberReg.test(ea)) {
      return ea;
    }
    //在idata中获取，如果获取不到就返回0
    else {
      //如果既没有.也没有#，则代表是普通值，则直接从idata获取
      if (ea.indexOf('.') == -1 && ea.indexOf('#') == -1) {
        rd = busiData[ea];
      }
      //如果表达式中存在.则是从列表中获取数据 :列表.平均值#费用
      else if (ea.indexOf('.') != -1) {
        try {
          let listKey = ea.split('.')[0];
          let listDataExpress = ea.split('.')[1];
          if (listKey && listDataExpress) {
            //取得列表的子属性  平均值#费用
            let listSubKey = listDataExpress.split("#")[0];
            let listData = busiData[listKey];
            //处理所属列表的函数及其属性取值
            if ('平均' == listSubKey || '平均值' == listSubKey) {
              let listSubEP = listDataExpress.split("#")[1];
              //判断平均的值是否存在缓存中
              if (busiData[ea + "_catch_avg"]) {
                rd = busiData[ea + "_catch_avg"];
              } else {
                let countNum = 0;
                if (busiData[ea + "_catch_count"]) {
                  countNum = busiData[ea + "_catch_count"];
                } else {
                  for (let i = 0; i < listData.length; i++) {
                    var ld = listData[i][listSubEP];
                    if (ld && isNumberReg.test(ld)) {
                      countNum += parseFloat(ld);
                    }
                  }
                  //将结果放入缓存中
                  busiData[ea + "_catch_count"] = countNum;
                }
                //求平均
                let avgNNum = countNum / listData.length;
                //将结果放入缓存中
                busiData[ea + "_catch_avg"] = avgNNum;
                rd = avgNNum;

              }
            } else if ('最大' == listSubKey || '最大值' == listSubKey) {
              let listSubEP = listDataExpress.split("#")[1];
              let maxNum = null;
              if (busiData[ea + "_catch_max"]) {
                maxNum = busiData[ea + "_catch_max"];
              } else {
                for (let i = 0; i < listData.length; i++) {
                  let ld = listData[i][listSubEP];
                  if (ld && isNumberReg.test(ld)) {
                    if (maxNum == null) {
                      maxNum = ld;
                    } else if (maxNum < ld) {
                      maxNum = ld;
                    }
                  }
                }
                //将结果放入缓存中
                busiData[ea + "_catch_max"] = maxNum;
              }
              rd = maxNum;
            } else if ('最小' == listSubKey || '最小值' == listSubKey) {
              let listSubEP = listDataExpress.split("#")[1];
              let minNum = null;
              if (busiData[ea + "_catch_min"]) {
                minNum = busiData[ea + "_catch_min"];
              } else {
                for (let i = 0; i < listData.length; i++) {
                  let ld = listData[i][listSubEP];
                  if (ld && isNumberReg.test(ld)) {
                    if (minNum == null) {
                      minNum = ld;
                    } else if (minNum > ld) {
                      minNum = ld;
                    }
                  }
                }
                //将结果放入缓存中
                busiData[ea + "_catch_min"] = minNum;
              }
              rd = minNum;
            } else if ('合计' == listSubKey || '求和' == listSubKey || '求合' == listSubKey) {
              let listSubEP = listDataExpress.split("#")[1];
              let countNum = 0;
              if (busiData[ea + "_catch_count"]) {
                countNum = busiData[ea + "_catch_count"];
              } else {
                for (let i = 0; i < listData.length; i++) {
                  var ld = listData[i][listSubEP];
                  if (ld && isNumberReg.test(ld)) {
                    countNum += parseFloat(ld);
                  }
                }
                //将结果放入缓存中
                busiData[ea + "_catch_count"] = countNum;
              }
              rd = countNum;
            } else if ('数量' == listSubKey || '长度' == listSubKey) {
              rd = busiData[listKey].length;
            } else if ('尾行' == listSubKey) {
              let listSubEP = listDataExpress.split("#")[1];
              let ld = listData[listData.length - 1][listSubEP];
              if (ld && isNumberReg.test(ld)) {
                rd = parseFloat(ld);
              } else if (ld) {
                rd = ld;
              }
            } else if ('首行' == listSubKey) {
              let listSubEP = listDataExpress.split("#")[1];
              let ld = listData[0][listSubEP];
              if (ld && isNumberReg.test(ld)) {
                rd = parseFloat(ld);
              } else if (ld) {
                rd = ld;
              }
            } else if ('行' == listSubKey) {
              let listSubEP = listDataExpress.split("#")[1];
              let ld = listData[row][listSubEP];
              if (ld && isNumberReg.test(ld)) {
                rd = parseFloat(ld);
              } else if (ld) {
                rd = ld;
              }
            }
            //指定的固定行的数据
            else if (isNumberReg.test(listSubKey)) {
              let listSubEP = listDataExpress.split("#")[1];
              let ld = listData[listSubKey][listSubEP];
              if (ld && isNumberReg.test(ld)) {
                rd = parseFloat(ld);
              } else if (ld) {
                rd = ld;
              }
            }
          }
        } catch (e) {
          console.error(e)
        }
      }
    }
    if (rd != null && isNumberReg.test(rd)) {
      return rd;
    } else if (rd) {
      return rd;
    }
    return null;
  }

  /**
   * 对输入数据进行合并拆分等处理，主要用来处理分页打印，多页打印等功能
   */
  static analysisDataFromTemplate(iData, templateJSON) {
    let tableListConfig = {};
    let pdJSON = templateJSON;
    //循环模板，找到所有表格控件，读取配置
    for (let j in pdJSON.rootModels) {
      //处理bindField
      if (pdJSON.rootModels[j].modelType == "PDTable") {
        //找到策略为超出后分页的表格
        let outDataRowStrategy = pdJSON.rootModels[j]["outDataRowStrategy"];
        if (outDataRowStrategy == 1 || outDataRowStrategy == '1') {
          //找到最大数据行的配置
          let maxDataRow = pdJSON.rootModels[j]["maxDataRow"];
          if (maxDataRow != 0 && maxDataRow != null && maxDataRow != '') {
            //找到第一个绑定的字段
            let table = pdJSON.rootModels[j];
            //计算最大数据行和最小数据行
            let dataRowStart = -1;
            let dataRowEnd = -1;
            //第一个绑定的列表key
            let listKey = null;
            //循环表格计算数据区域和表格的配置数据
            for (let ri = 0; ri < table.rows.length; ri++) {
              for (let rj = 0; rj < table.rows[ri].length; rj++) {
                let curCell = table.rows[ri][rj];
                //数据行
                if (curCell.dataRow == 2 || curCell.dataRow == '2' || curCell.attrs['dataRow'] == 2 || curCell.attrs['dataRow'] == '2') {
                  if (dataRowStart == -1) {
                    dataRowStart = ri;
                  }
                  if (dataRowEnd < ri) {
                    dataRowEnd = ri;
                  }
                  let expressContent = null;
                  //获取绑定字段
                  if (curCell.bindField || curCell.attrs.bindField) {
                    expressContent = curCell.bindField ? curCell.bindField : curCell.attrs.bindField;
                  }
                  //获取text中的绑定字段
                  else if (curCell.text && curCell.text.indexOf("#{") != -1) {
                    let t = curCell.text;
                    let reg = /#\{[^\{\}]*\}/g;
                    let result = reg.exec(t);
                    if (result != null && result.length > 0) {
                      let rs = result[0].replaceAll(" ", "");
                      expressContent = rs.substring(2, rs.length - 1);
                    }
                  }
                  //解析表达式中的列表绑定
                  if (expressContent) {
                    //去掉表达式中的空格
                    expressContent = expressContent.replaceAll(" ", "");
                    let expressArray = expressContent.split(contentSplitReg);
                    if (expressArray != null && expressArray.length > 0) {
                      //循环对每一个子项进行求值,并返回替换表达式中的值
                      for (let i = 0; i < expressArray.length; i++) {
                        let ea = expressArray[i];
                        if (ea.indexOf('.') != -1) {
                          try {
                            listKey = ea.split('.')[0];
                          } catch (e) { }
                        }
                      }
                    }
                  }
                }
              }
            }
            if (listKey) {
              //能输出的列表数据行=最大数据行/(dataRowEnd-dataRowStart+1)
              let rowNum = parseInt(maxDataRow / (dataRowEnd - dataRowStart + 1));
              if (rowNum >= 1) {
                tableListConfig[listKey] = rowNum;
              }
            }
          }
        }
      }
    }
    let newIDatas = [];
    //根据配置，对数据进行拆分
    for (let listKey in tableListConfig) {
      if (iData[listKey] && tableListConfig[listKey] && tableListConfig[listKey] > 0 && iData[listKey].length > tableListConfig[listKey]) {
        //拆分后的数组
        let subArrays = this.subArrayGroup(iData[listKey], tableListConfig[listKey]);
        //执行拆分
        for (let si = 0; si < subArrays.length; si++) {
          let newIData = cloneDeep(iData);
          //替换拆分的数据
          newIData[listKey] = subArrays[si];
          newIDatas[newIDatas.length] = newIData;
        }
      }
    }
    //如果未执行替换，则原样返回
    if (newIDatas.length == 0) {
      newIDatas[0] = iData;
    }
    return newIDatas;
  }

  /**
   * 以templateJSON为模板，循环inputData，替换模板值后，生成新的JSON数组返回
   * 如果存在bindField则全部利用bindField进行替换
   * 如果不存在bindField但在text中出现了#{}包起来的表达式，则执行作为部分表达式替换
   * 循环表格的数据，对表格进行循环输出，并处理分页打印
   */
  static analysisBindData(inputData, templateJSON) {
    //将传入的数据与表格进行对比，根据是否分页打印对数据本身进行拆分
    let processDatas = [];
    for (let i = 0; i < inputData.length; i++) {
      let idata = inputData[i];
      let dataList = this.analysisDataFromTemplate(idata, templateJSON);
      processDatas.push.apply(processDatas, dataList);
    }
    inputData = processDatas;
    let printJSON = [];
    //根据传入数据的数量，复制设计器，并替换里面的值
    for (let i = 0; i < inputData.length; i++) {
      let idata = inputData[i];
      let pdJSON = JSON.stringify(templateJSON.toJSON());
      eval("pdJSON = " + pdJSON + ";");
      //处理水印
      let pdPaper = pdJSON["pdPaper"];
      let watermarkReplaceData = this.processTextOrBindFieldExpress(pdPaper, idata);
      if (watermarkReplaceData) {
        pdPaper.watermarkBase64 = watermarkReplaceData;
        pdPaper.attrs['watermarkBase64'] = watermarkReplaceData;
        pdPaper.watermark = watermarkReplaceData;
        pdPaper.attrs['watermark'] = watermarkReplaceData;
        pdPaper.bindField = null;
        pdPaper.attrs['bindField'] = null;
      }
      //用当前的值替换设计器中的值
      for (let j in pdJSON.rootModels) {
        let control = pdJSON.rootModels[j];
        if (control.modelType == 'PDTable') {
          let table = control;
          let dataRowStart = -1;
          let dataRowEnd = -1;
          let iDataList = null;
          //获取表格输出的数据行的开始行与结束行
          for (let ri = 0; ri < table.rows.length; ri++) {
            for (let rj = 0; rj < table.rows[ri].length; rj++) {
              var curCell = table.rows[ri][rj];
              if (curCell.dataRow == 2 || curCell.dataRow == '2' || curCell.attrs['dataRow'] == 2 || curCell.attrs['dataRow'] == '2') {
                if (dataRowStart == -1) {
                  dataRowStart = ri;
                }
                if (dataRowEnd < ri) {
                  dataRowEnd = ri;
                }
                if (!iDataList) {
                  let expressContent = null;
                  //获取绑定字段
                  if (curCell.bindField || curCell.attrs.bindField) {
                    expressContent = curCell.bindField ? curCell.bindField : curCell.attrs.bindField;
                  }
                  //获取text中的绑定字段
                  else if (curCell.text && curCell.text.indexOf("#{") != -1) {
                    let t = curCell.text;
                    let reg = /#\{[^\{\}]*\}/g;
                    let result = reg.exec(t);
                    if (result != null && result.length > 0) {
                      let rs = result[0].replaceAll(" ", "");
                      expressContent = rs.substring(2, rs.length - 1);
                    }
                  }
                  //解析表达式中的列表绑定
                  if (expressContent) {
                    //去掉表达式中的空格
                    expressContent = expressContent.replaceAll(" ", "");
                    let expressArray = expressContent.split(contentSplitReg);
                    if (expressArray != null && expressArray.length > 0) {
                      //循环对每一个子项进行求值,并返回替换表达式中的值
                      for (let ei = 0; ei < expressArray.length; ei++) {
                        let ea = expressArray[ei];
                        if (ea.indexOf('.') != -1) {
                          try {
                            let listKey = ea.split('.')[0];
                            iDataList = idata[listKey];
                          } catch (e) { }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          //循环处理数据行与非数据行
          for (var ri = 0; ri < table.rows.length; ri++) {
            //如果是定义了数据的行,则进行表格样式（合并单元格）与绑定关系的复制，并替换值，随后跳过数据行区域，输出普通数据行区域
            if (ri >= dataRowStart && ri <= dataRowEnd) {
              let sourceRowNum = dataRowEnd - dataRowStart + 1;
              //执行同步复制
              let mergeCells = [];
              //循环数据，执行数据复制

              for (var c = 1; c < iDataList.length; c++) {
                for (var ci = dataRowEnd + (c - 1) * sourceRowNum + 1; ci < dataRowEnd + c * sourceRowNum + 1; ci++) {
                  let offsetI = null;
                  if (sourceRowNum == 1) {
                    offsetI = dataRowStart
                  } else {
                    offsetI = (ci - dataRowEnd + 1) % sourceRowNum + dataRowStart
                  }
                  for (let cj = 0; cj < table.rows[ci].length; cj++) {
                    //获取要复制的单元格
                    let sourceCell = table.rows[offsetI][cj];
                    //取得目标单元格
                    let targetCell = table.rows[ci][cj];
                    //执行列表值绑定计算

                    let replaceData = this.processTextOrBindFieldExpress(sourceCell, idata, c);
                    targetCell.text = replaceData;
                    targetCell.attrs['text'] = replaceData;
                    targetCell.bindField = null;
                    targetCell.attrs['bindField'] = null;
                    targetCell.convertToRMBY = '1';
                    //字体样式
                    targetCell.align = sourceCell.align;
                    targetCell.attrs.align = sourceCell.attrs.align;
                    targetCell.valign = sourceCell.valign;
                    targetCell.attrs.valign = sourceCell.attrs.valign;
                    targetCell.feed = sourceCell.feed;
                    targetCell.attrs.feed = sourceCell.attrs.feed;
                    targetCell.autoScaleFill = sourceCell.autoScaleFill;
                    targetCell.attrs.autoScaleFill = sourceCell.attrs.autoScaleFill;
                    targetCell.font = sourceCell.font;
                    targetCell.attrs.font = sourceCell.attrs.font;
                    targetCell.fill = sourceCell.fill;
                    targetCell.attrs.fill = sourceCell.attrs.fill;
                    targetCell.border = sourceCell.border;
                    targetCell.attrs.border = sourceCell.attrs.border;
                    //记录合并单元格
                    if (sourceCell.mergeRowNum > 1 || sourceCell.mergeColNum > 1) {
                      targetCell.mergeRowNum = sourceCell.mergeRowNum;
                      targetCell.mergeColNum = sourceCell.mergeColNum;
                      mergeCells[mergeCells.length] = targetCell;
                    }
                  }
                }
              }

              //执行合并单元格
              for (let mi = 0; mi < mergeCells.length; mi++) {
                let mc = mergeCells[mi];
                //合并单元格
                this.mergeCells(table, mc);
              }
              //处理绑定的数据行
              for (var ci = dataRowStart; ci <= dataRowEnd; ci++) {
                for (let cj = 0; cj < table.rows[ci].length; cj++) {
                  let sourceCell = table.rows[ci][cj];
                  //执行列表值绑定计算
                  let replaceData = this.processTextOrBindFieldExpress(sourceCell, idata, 0);
                  sourceCell.text = replaceData;
                  sourceCell.attrs['text'] = replaceData;
                  sourceCell.bindField = null;
                  sourceCell.attrs['bindField'] = null;
                  sourceCell.convertToRMBY = '1';
                }
              }
              //跳过已处理的数据行
              ri = dataRowStart + iDataList.length * sourceRowNum
            }
            if (ri < table.rows.length) {
              //处理普通单元格
              for (var rj = 0; rj < table.rows[ri].length; rj++) {
                var curCell = table.rows[ri][rj];
                let replaceData = this.processTextOrBindFieldExpress(curCell, idata, ri);
                curCell.text = replaceData;
                curCell.attrs['text'] = replaceData;
                curCell.bindField = null;
                curCell.attrs['bindField'] = null;
                curCell.convertToRMBY = '1';
              }
            }
          }
        } else if (control.modelType == 'PDImage') {
          let replaceData = this.processTextOrBindFieldExpress(control, idata);
          if (replaceData) {
            control.base64 = replaceData;
            control.attrs['base64'] = replaceData;
            control.src = replaceData;
            control.attrs['src'] = replaceData;
            control.bindField = null;
            control.attrs['bindField'] = null;
          }
        } else {
          let replaceData = this.processTextOrBindFieldExpress(control, idata);
          control.text = replaceData;
          control.attrs['text'] = replaceData;
          control.bindField = null;
          control.attrs['bindField'] = null;
          control.convertToRMBY = '1';
        }
      }
      printJSON[i] = pdJSON;
    }

    return printJSON;
  }


  /**
   * 用于处理绑定字段或文本的表达式替换
   */
  static processTextOrBindFieldExpress(control, idata, row) {
    //处理bindField
    if (control.bindField || control.attrs.bindField) {
      //简单做一个替换程序
      let replaceData = "";
      //判断表达式的类型，普通类型、对象、对象列表以及其他类型
      let expressContent = control.bindField ? control.bindField : control.attrs.bindField;
      //执行表达式处理与替换
      replaceData = this.analysisExpress(expressContent, idata, row);
      if (!replaceData) {
        replaceData = "";
      }
      if (control.attrs.convertToRMBY == 2 || control.attrs.convertToRMBY == '2' || control.convertToRMBY == 2 || control.convertToRMBY == '2') {
        replaceData = PDSetting.dealBigMoney(replaceData);
      }
      return replaceData;
    }
    //处理text
    else if (control.text && control.text.indexOf("#{") != -1) {
      let t = control.text;
      let replaceData = "";
      while (t && t != '') {
        let reg = /#\{[^\{\}]*\}/g;
        let result = reg.exec(t);
        if (result != null && result.length > 0) {
          replaceData += t.substring(0, result.index);
          let rs = result[0].replaceAll(" ", "");
          let aer = this.analysisExpress(rs.substring(2, rs.length - 1), idata, row);
          if (control.attrs.convertToRMBY == 2 || control.attrs.convertToRMBY == '2' || control.convertToRMBY == 2 || control.convertToRMBY == '2') {
            aer = this.dealBigMoney(aer);
          }
          replaceData += aer;
          t = t.substr(result.index + result[0].length);
        } else {
          replaceData += t;
          break;
        }
      }
      return replaceData;
    } else if (control.text) {
      if (control.attrs.convertToRMBY == 2 || control.attrs.convertToRMBY == '2' || control.convertToRMBY == 2 || control.convertToRMBY == '2') {
        return this.dealBigMoney(control.text);
      } else {
        return control.text;
      }
    }
  }

  /**
   * 转换为人民币大写
   * @param money 数字
   * @returns 
   */
  static toBigMoney(money): string {
    //汉字的数字
    let cnNums = new Array('零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖');
    //基本单位
    let cnIntRadice = new Array('', '拾', '佰', '仟');
    //对应整数部分扩展单位
    let cnIntUnits = new Array('', '万', '亿', '兆');
    //对应小数部分单位
    let cnDecUnits = new Array('角', '分', '毫', '厘');
    //整数金额时后面跟的字符
    let cnInteger = '整';
    //整型完以后的单位
    let cnIntLast = '元';
    //最大处理的数字
    let maxNum = 999999999999999.9999;
    //金额整数部分
    let integerNum;
    //金额小数部分
    let decimalNum;
    //输出的中文金额字符串
    let chineseStr = '';
    //分离金额后用的数组，预定义
    let parts;
    // 传入的参数为空情况 
    if (money == '' || money == null || money == undefined) {
      return '';
    }
    money = parseFloat(money)
    if (money >= maxNum) {
      return ''
    }
    // 传入的参数为0情况 
    if (money == 0) {
      chineseStr = cnNums[0] + cnIntLast + cnInteger;
      return chineseStr
    }
    // 转为字符串
    money = money.toString();
    // indexOf 检测某字符在字符串中首次出现的位置 返回索引值（从0 开始） -1 代表无
    if (money.indexOf('.') == -1) {
      integerNum = money;
      decimalNum = ''
    } else {
      parts = money.split('.');
      integerNum = parts[0];
      decimalNum = parts[1].substr(0, 4);
    }
    //转换整数部分
    if (parseInt(integerNum, 10) > 0) {
      let zeroCount = 0;
      let IntLen = integerNum.length
      for (let i = 0; i < IntLen; i++) {
        let n = integerNum.substr(i, 1);
        let p = IntLen - i - 1;
        let q = p / 4;
        let m = p % 4;
        if (n == '0') {
          zeroCount++;
        } else {
          if (zeroCount > 0) {
            chineseStr += cnNums[0]
          }
          zeroCount = 0;
          chineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
        }
        if (m == 0 && zeroCount < 4) {
          chineseStr += cnIntUnits[q];
        }
      }
      // 最后+ 元
      chineseStr += cnIntLast;
    }
    // 转换小数部分
    if (decimalNum != '') {
      let decLen = decimalNum.length;
      for (let i = 0; i < decLen; i++) {
        let n = decimalNum.substr(i, 1);
        if (n != '0') {
          chineseStr += cnNums[Number(n)] + cnDecUnits[i]
        }
      }
    }
    if (chineseStr == '') {
      chineseStr += cnNums[0] + cnIntLast + cnInteger;
    } else if (decimalNum == '') {
      chineseStr += cnInteger;
    }

    return chineseStr
  }


  /**
   * 精准返回num1除以num2的结果
   */
  static preciseDiv(num1: number, num2: number): number {
    let t1 = 0, t2 = 0, r1, r2;
    try { t1 = num1.toString().split(".")[1].length } catch (e) { }
    try { t2 = num2.toString().split(".")[1].length } catch (e) { }
    r1 = Number(num1.toString().replace(".", ""))
    r2 = Number(num2.toString().replace(".", ""))
    return (r1 / r2) * Math.pow(10, t2 - t1);
  }

  /**
   * 精准返回num1乘以num2的结果
   */
  static preciseTimes(num1: number, num2: number): number {
    let m = 0, s1 = num1.toString(), s2 = num2.toString();
    try { m += s1.split(".")[1].length } catch (e) { }
    try { m += s2.split(".")[1].length } catch (e) { }
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
  }

  /**
   * 精准返回num1+num2的结果
   */
  static preciseAdd(num1: number, num2: number): number {
    let r1, r2, m;
    try { r1 = num1.toString().split(".")[1].length } catch (e) { r1 = 0 }
    try { r2 = num2.toString().split(".")[1].length } catch (e) { r2 = 0 }
    m = Math.pow(10, Math.max(r1, r2))
    return (num1 * m + num2 * m) / m
  }

  /**
   * 精准返回num1-num2的结果
   */
  static preciseSub(num1: number, num2: number): number {
    let r1, r2, m, n;
    try { r1 = num1.toString().split(".")[1].length } catch (e) { r1 = 0 }
    try { r2 = num2.toString().split(".")[1].length } catch (e) { r2 = 0 }
    m = Math.pow(10, Math.max(r1, r2));
    n = (r1 >= r2) ? r1 : r2;
    return parseFloat(((num1 * m - num2 * m) / m).toFixed(n));
  }
}

export default DDeiUtil
