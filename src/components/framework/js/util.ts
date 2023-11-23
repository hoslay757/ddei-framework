import DDeiConfig from './config.js'
import DDeiAbstractShape from './models/shape.js';
import { clone } from 'lodash'
import DDei from './ddei.js';
import { Matrix3, Vector3 } from 'three';

class DDeiUtil {



  // ============================ 静态方法 ============================

  //钩子函数，调用外部的配置属性读取函数,由外部调用者初始化
  static getAttrValueByConfig: Function;

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
      md = DDeiUtil.cloneModel(model);
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
      md = DDeiUtil.cloneModel(model);
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
  static cloneModel(sourceModel: DDeiAbstractShape): DDeiAbstractShape {
    if (!sourceModel) {
      return;
    }
    let returnModel = clone(sourceModel);
    returnModel.pvs = []
    sourceModel.pvs.forEach(pv => {
      returnModel.pvs.push(clone(pv));
    });
    returnModel.cpv = clone(sourceModel.cpv)
    returnModel.initPVS()
    return returnModel;
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
      plLength = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0))
    } else {
      //根据向量外积计算面积
      let s = (x0 - x1) * (y2 - y1) - (y0 - y1) * (x2 - x1)
      //计算直线上两点之间的距离
      let d = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
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
                movePath = "x:0.25,y:-0.25,x:-1.5,y:0.25,x:0.25"
              }
              else {
                movePath = "x:1"
              }
            }
            //开始高于结束
            else if (startPoint.y > endPoint.y) {
              if (startPoint.x > endPoint.x) {
                movePath = "x:0.25,y:-0.5,x:-1.5,y:-0.5,x:0.25"
              }
              else {
                movePath = "x:0.5,y:-1,x:0.5"
              }
            }
            //结束高于开始
            else {
              if (startPoint.x > endPoint.x) {
                movePath = "x:0.25,y:0.5,x:-1.5,y:0.5,x:0.25"
              }
              else {
                movePath = "x:0.5,y:1,x:0.5"
              }
            }
          } break;
          case -90: {
            //Y相等
            if (Math.abs(startPoint.y - endPoint.y) <= 1) {
              if (startPoint.x > endPoint.x) {
                movePath = "x:0.25,y:-0.25,x:-1.25,y:0.25"
              }
            }
            //开始高于结束
            else if (startPoint.y > endPoint.y) {
              if (startPoint.x > endPoint.x) {
                movePath = "x:0.25,y:-1.25,x:-1.25"
              }
              else {
                movePath = "x:0.5,y:-1.25,x:0.5,y:0.25"
              }
            }
            //结束高于开始
            else {
              if (startPoint.x > endPoint.x) {
                movePath = "x:0.25,y:0.5,x:-1.25,y:0.5"
              }
              else {
                movePath = "x:1,y:1"
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
                movePath = "x:0.25,y:-1.25,x:-1.25"
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
   * 计算线段相对于窗口的角度
   */
  static getLineAngle(x1: number, y1: number, x2: number, y2: number): number {
    //归到原点，求夹角
    x2 -= x1
    y2 -= y1
    let v1 = new Vector3(1, 0, 0)
    let v2 = new Vector3(x2, y2, 0)
    let lineAngle = parseFloat((v1.angleTo(v2) * 180 / Math.PI).toFixed(4));
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
    if (/(y+)/.test(fmt)) { //根据y的长度来截取年
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
   * 是否为safari浏览器
   */
  static isSafari(): boolean {
    // 判断是否Safari浏览器
    return /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) > -1  // 是Safari为true，
  }


}

export default DDeiUtil
