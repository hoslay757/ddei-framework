import DDeiConfig from './config.js'
import DDeiAbstractShape from './models/shape.js';
import { clone, cloneDeep, isDate, isNumber, isString } from 'lodash-es'
import DDei from './ddei.js';
import { Matrix3, Vector3 } from 'three';
import DDeiModelArrtibuteValue from './models/attribute/attribute-value';
import DDeiStage from './models/stage';
import DDeiColor from './color.js';
import DDeiLink from './models/link.js';
import DDeiEnumOperateType from './enums/operate-type.js';
import DDeiModelLink from './models/modellink.js';

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
  //钩子函数，显示右键菜单
  static showContextMenu: Function;
  //钩子函数，返回控件的子控件定义，用于创建控件时自动创建子控件
  static getSubControlJSON: Function;
  //钩子函数，返回线控件的定义
  static getLineInitJSON: Function;
  //钩子函数，返回控件的定义
  static getModelInitJSON: Function;
  //钩子函数，获取业务数据
  static getBusiData: Function;
  //钩子函数，获取快捷编辑文本框
  static getEditorText: Function;
  //钩子函数，获取样式属性变量值
  static getStyleValue: Function;
  //钩子函数，获取ID
  static getEditorId: Function;
  //钩子函数，调用回调函数
  static invokeCallbackFunc: Function;
  //钩子函数，通知改变
  static notifyChange: Function;
  //钩子函数，获取编辑器实例
  static getEditorInsByDDei: Function;

  //钩子函数，获取创建控件
  static createControl: Function;

  //钩子函数,判断当前实例是否可以在后台激活，允许后台激活的实例，在当前实例为非ACTIVE_INSTANCE时，依然能够执行部分后台操作
  static isBackActive: Function;


  //用于接管存取方法
  static setLocalStorageData(key: string, value: object | string | null) {
    
    if (window.setLocalStorageData){
      window.setLocalStorageData(key,value)
    }else{
      try {
        if (localStorage) {
          localStorage.setItem(key, value)
        }
      } catch (e) {
        console.warn("No Access LocalStorage")
      }
    }
  }

  static getLocalStorageData(key: string): object | string | null {
    if (window.getLocalStorageData) {
      return window.getLocalStorageData(key)
    } else {
      try {
        if (localStorage) {
          return localStorage.getItem(key)
        } else {
          return null
        }
      } catch (e) {
        console.warn("No Access LocalStorage")
        return null
      }

    }
  }

  static removeLocalStorageData(key: string): void {
    if (window.removeLocalStorageData) {
      window.removeLocalStorageData(key)
    } else {
      try {
        if (localStorage) {
          localStorage.removeItem(key)
        }
      } catch (e) {
        console.warn("No Access LocalStorage")
      }
    }
    
  }



  //创建renderviewer元素
  static createRenderViewer = function (model, operate, tempShape, composeRender) {
    if (model?.stage?.ddInstance) {
      let editor = DDeiUtil.getEditorInsByDDei(model.stage.ddInstance)
      if (editor) {
        editor.createRenderViewer(model, operate, tempShape, composeRender)
      }
    }
  }

  //移除renderviewer元素，由editor在创建时传入
  static removeRenderViewer = function (model, operate, tempShape, composeRender) {
    if (model?.stage?.ddInstance) {
      let editor = DDeiUtil.getEditorInsByDDei(model.stage.ddInstance)
      if (editor) {
        editor.removeRenderViewer(model, operate, tempShape, composeRender)
      }
    }
  }

  //钩子函数,判定控件否为hidden的函数，可以由外部来覆写，从而增加前置或者后置判断逻辑
  static isModelHidden: Function = function(model:DDeiAbstractShape):boolean{
    if (model.hidden){
      return true;
    }else{
      let pModel = model.pModel;
      while(pModel && pModel.baseModelType != 'DDeiLayer'){
        if (pModel.hidden){
          return true
        }
        pModel = pModel.pModel
      }
    }
    return false
  };



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

  //最新选择的颜色
  static recentlyChooseColors = null

  /**
   * 当前用户的操作系统
   */
  static USER_OS: string = ""
  static {
    let userAgent = navigator.userAgent; // 获取User Agent字符串
    DDeiUtil.USER_OS = "WIN"
    if (/Mac|iPod|iPhone|iPad/.test(userAgent)) {
      DDeiUtil.USER_OS = "MAC"
    } else if (/Linux/.test(userAgent)) {
      DDeiUtil.USER_OS = "LINUX"
    }
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
  static measureText(text: string, font, ctx, fontSize): object {

    let key = text + "_" + font
    if (!DDeiUtil.cacheTextCharSize.has(key)) {
      ctx.font = font;
      let rect = ctx.measureText(text);
      //计算修正值和实际高度
      DDeiUtil.cacheTextCharSize.set(key, { width: rect.width, height: rect.fontBoundingBoxAscent + rect.fontBoundingBoxDescent, dHeight: rect.fontBoundingBoxAscent })
    }
    return DDeiUtil.cacheTextCharSize.get(key);
  }

  /**
   * 绘制圆角矩形
   * @param ctx 
   * @param x x
   * @param y y 
   * @param width 宽度
   * @param height 高度
   * @param radius 圆角
   * @param stroke 是否绘制
   * @param strokeColor 绘制颜色
   * @param fill 是否填充
   * @param fillColor 填充颜色
   */
  static drawRectRound(ctx, x: number, y: number, width: number, height: number, radius: number = 0, stroke: boolean = true, strokeColor: string = "black", fill: boolean = true, fillColor: string = "white") {
    if ((stroke || fill) && width > 0 && height > 0) {
      ctx.save()
      ctx.beginPath();
      ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
      ctx.lineTo(width - radius + x, y);
      ctx.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2);
      ctx.lineTo(width + x, height + y - radius);
      ctx.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2);
      ctx.lineTo(radius + x, height + y);
      ctx.arc(radius + x, height - radius + y, radius, Math.PI * 1 / 2, Math.PI);
      ctx.closePath();
      if (fill) {
        ctx.fillStyle = fillColor
        ctx.fill()
      }
      if (stroke) {
        ctx.strokeStyle = strokeColor
        ctx.stroke()
      }
      ctx.restore()
    }
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
      
      //将当前操作控件加入临时选择控件
      md.id = md.id + "_shadow"
      if (md?.baseModelType == "DDeiContainer") {
        let newModels = new Map();
        // let newMidList = new Array();
        md.models.forEach(smi => {
          let sm = DDeiUtil.getShadowControl(smi)
          sm.id = sm.id.substring(0, sm.id.lastIndexOf("_shadow"))
          sm.pModel = md;
          newModels.set(sm.id, sm)
          // newMidList.push(sm.id);
          sm.initRender();
        });
        md.models = newModels;
        // md.midList = newMidList;
      }
      md.initRender();

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
    returnModel.sptStyle = cloneDeep(sourceModel.sptStyle)

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
  static getDomAbsPosition(element, editor): object {
    //计算x坐标
    let actualLeft = element.offsetLeft;
    let actualTop = element.offsetTop;
    let current = element.offsetParent;
    while (current) {
      actualLeft += current.offsetLeft;
      actualTop += (current.offsetTop + current.clientTop);
      current = current.offsetParent;
    }
    if (editor) {
      let editorElement = document.getElementById(editor.id);
      let editorPos = DDeiUtil.getDomAbsPosition(editorElement)
      actualLeft -= editorPos.left
      actualTop -= editorPos.top
    }
    //返回结果
    return { left: actualLeft, top: actualTop }
  }

  /**
   * 返回dom到editor元素之间的滚动高度
   * @param element 
   */
  static getDomScroll(element, editor): object {
    //计算x坐标
    let scrollTop = 0;
    let scrollLeft = 0;
    let current = element.parentElement;
    let editorElement = document.getElementById(editor.id);
    while (current && current != editorElement) {
      scrollTop += current.scrollTop;
      scrollLeft += current.scrollLeft;
      current = current.parentElement;
    }
    
    //返回结果
    return { left: scrollLeft, top: scrollTop }
  }

  

  /**
   * 返回控件在dom下的绝对坐标
   * @param element 
   */
  static getModelsDomAbsPosition(models: DDeiAbstractShape[]): object {
    if (models?.length > 0) {
      //如果只有1个元素，则获取其旋转前的位置以及旋转量
      let outRect
      if(models.length == 1){
        let model = models[0]
        if (model.rotate){
          let pvs = model.operatePVS ? model.operatePVS : model.pvs;
          let zeroPvs = DDeiUtil.pointsToZero(pvs, model.cpv, model.rotate)
          zeroPvs = DDeiUtil.zeroToPoints(zeroPvs, model.cpv, 0, 1, 1)
          outRect = DDeiAbstractShape.pvsToOutRect(zeroPvs);
          outRect.rotate = model.rotate
        }else{
          outRect = DDeiAbstractShape.getOutRectByPV(models);
          outRect.rotate = 0
        }
      }else{
        outRect = DDeiAbstractShape.getOutRectByPV(models);
        outRect.rotate = 0
      }
      let stageRatio = models[0].stage?.getStageRatio();
      outRect.x *= stageRatio
      outRect.x1 *= stageRatio
      outRect.y *= stageRatio
      outRect.y1 *= stageRatio
      outRect.width *= stageRatio
      outRect.height *= stageRatio

      let wpv = models[0].stage.wpv
      let domEle = models[0].stage.ddInstance.render.realCanvas.parentElement
      let canvasPos = DDeiUtil.getDomAbsPosition(domEle)
      //返回结果
      outRect.left = canvasPos.left + outRect.x + wpv.x
      outRect.top = canvasPos.top + outRect.y + wpv.y
      outRect.cLeft = canvasPos.left
      outRect.cTop = canvasPos.top
      outRect.cWidth = domEle.clientWidth
      outRect.cHeight = domEle.clientHeight
      return outRect
    } else {
      return null
    }
  }

  static sortRendList(model){
    //将当前控件以及composes按照zindex顺序排列并输出
    let rendList = [];
    if (model.composes?.length > 0) {
      rendList = rendList.concat(model.composes);
    }
    rendList.push(model)
    rendList.sort((a, b) => {

      if ((a.cIndex || a.cIndex == 0) && (b.cIndex || b.cIndex == 0)) {
        return a.cIndex - b.cIndex
      } else if ((a.cIndex || a.cIndex == 0) && !(b.cIndex || b.cIndex == 0)) {
        return 1
      } else if (!(a.cIndex || a.cIndex == 0) && (b.cIndex || b.cIndex == 0)) {
        return -1
      } else {
        return 0
      }
    })
    return rendList
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
   * 生成唯一编码
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
   * 创建依附快捷控件
   * @param model 被依附控件
   * @param text 文本
   */
  static createDepLinkModel(model:DDeiAbstractShape, text:string,type:number|null = null) {
    if (text && model) {
      let stage = model.stage
      let ddInstance = stage.ddInstance
      let editState = DDeiUtil.invokeCallbackFunc("EVENT_CONTROL_EDIT_BEFORE", DDeiEnumOperateType.EDIT, { models: [model] }, ddInstance)
      if (editState == 0 || editState == 1) {
        //判断是否已存在快捷编辑图形
        let realModel = null;
        //参考点位
        let posPoint = null;
        //位置类型
        let posType;
        let isCreateRealModel = false
        let isLineLM = false
        //如果当前图形为线，或配置了depPos则创建
        if (model.baseModelType == 'DDeiLine') {
          posType = type ? type :3
          //奇数，取正中间
          let pi = Math.floor(model.pvs.length / 2)
          if (model.pvs.length % 3 == 0) {
            posPoint = model.pvs[pi];
          }
          //偶数，取两边的中间点
          else {
            posPoint = {
              x: (model.pvs[pi - 1].x + model.pvs[pi].x) / 2,
              y: (model.pvs[pi - 1].y + model.pvs[pi].y) / 2
            }
          }
          model.linkModels.forEach(lm => {
            if (lm.type == posType) {
              realModel = lm.dm;
            }
          });
          if (!realModel) {
            isCreateRealModel = true;
            isLineLM = true;
          }
        } else {
          let modelDefine = DDeiUtil.getControlDefine(model);
          //如果存在配置，则直接采用配置，如果不存在配置则读取文本区域
          if (modelDefine?.define?.sample?.depPos) {
            let depPos = modelDefine.define.sample.depPos;
            let essBounds = model.essBounds;
            let dmEssBounds = { width: 80, height: 18 }
            posType = depPos.type;
            if (!type || posType == type){
              if (depPos.type == 5) {
                posPoint = model.cpv;
              } //上
              else if (depPos.type == 6) {
                posPoint = {
                  x: model.cpv.x,
                  y: essBounds.y - dmEssBounds.height / 2
                }
              }
              //右
              else if (depPos.type == 7) {
                posPoint = {
                  x: essBounds.x1 + dmEssBounds.width / 2,
                  y: model.cpv.y
                }
              }
              //下
              else if (depPos.type == 8) {
                posPoint = {
                  x: model.cpv.x,
                  y: essBounds.y1 + dmEssBounds.height / 2
                }
              }
              //左
              else if (depPos.type == 9) {
                posPoint = {
                  x: essBounds.x - dmEssBounds.width / 2,
                  y: model.cpv.y
                }
              }
              isCreateRealModel = true
            }
          }
          
        }
        if (isCreateRealModel) {
          //根据control的定义，初始化临时控件，并推送至上层Editor
          let dataJson = {

            modelCode: "100200",

          };

          let controlDefine = DDeiUtil.getControlDefine(dataJson)
          for (let i in controlDefine?.define) {
            dataJson[i] = cloneDeep(controlDefine.define[i]);
          }
          dataJson["id"] = "lsm_" + (stage.idIdx++)
          dataJson["width"] = 80
          dataJson["height"] = 28
          dataJson["font"] = { size: 12 }
          dataJson["text"] = text
          dataJson["textStyle"] = { paddingWeight: 0 }
          if (isLineLM) {

            dataJson["fill"] = { type: 1, color: 'white' }
          }
          realModel = ddInstance.controlModelClasses["DDeiPolygon"].initByJSON(
            dataJson,
            { currentStage: stage, currentDdInstance: ddInstance, currentContainer: model.pModel }
          );
          let move1Matrix = new Matrix3(
            1, 0, posPoint.x,
            0, 1, posPoint.y,
            0, 0, 1);
          realModel.transVectors(move1Matrix)
          model.layer.addModel(realModel, false);

          realModel.initRender()
          let lineLink = new DDeiModelLink({
            depModel: model,
            type: posType,
            dm: realModel,
            dx: 0,
            dy: 0
          })
          realModel.depModel = model
          model.linkModels.set(realModel.id, lineLink);
        }
        
      }
    }
  }

  /**
   * 已知两点求其中间以及延长线上的第三点，有len和rate两种计算策略,如果超出按out值，返回实际长度（0），或者按照out设置的值作为长度比例
   * @param x0 点1x
   * @param y0 点1y
   * @param x1 点2x
   * @param y1 点2y
   * @param mode 模式，1长度，2比例
   * @param value 值
   * @param out 超出策略，-1原样，其他，比例
   */
  static getPathPoint(x0: number, y0: number, x1: number, y1: number,mode:number = 1,value:number = 0,out:number = -1,distance:number|null = null):object{
    //线段长度
    let pointDistance = distance ? distance : DDeiUtil.getPointDistance(x0, y0, x1, y1)
    let targetLen
    let rate;
    if (mode == 1) {
      targetLen = value
      if (out != -1 && targetLen > pointDistance){
        targetLen = pointDistance * out;
      }
      rate = targetLen/pointDistance
    }else{
      targetLen = pointDistance * value
      if (out != -1 && targetLen > pointDistance) {
        targetLen = pointDistance * out;
      }
      rate = targetLen / pointDistance
    }
    //线段角度
    let sita = parseFloat(DDeiUtil.getLineAngle(x0, y0, x1, y1).toFixed(4))
    //构建向量,基于0坐标，长度为targetLen
    let point = new Vector3(targetLen,0,1)
    //构建矩阵
    let m1 = new Matrix3()
    if (sita != 0 && sita != 360){
      let angle = (-sita * DDeiConfig.ROTATE_UNIT).toFixed(4);
      let rotateMatrix = new Matrix3(
        Math.cos(angle), Math.sin(angle), 0,
        -Math.sin(angle), Math.cos(angle), 0,
        0, 0, 1);
      m1.premultiply(rotateMatrix)
    }
    let moveMatrix = new Matrix3(
      1, 0, x0,
      0, 1, y0,
      0, 0, 1);


    m1.premultiply(moveMatrix)

    point.applyMatrix3(m1)
    point.sita = sita;
    point.rate = rate;
    point.len = targetLen

    return point;
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

  /**
   * 两个矩形是否相交
   * @param rect1 
   * @param rect2 
   * @returns 
   */
  static isRectCross(rect1, rect2): boolean {
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
  static getLineAngle(x1: number, y1: number, x2: number, y2: number,radius:boolean = false): number {
    //归到原点，求夹角
    x2 -= x1
    y2 -= y1
    let v1 = new Vector3(1, 0, 0)
    let v2 = new Vector3(x2, y2, 0)
    if (radius){
      return v1.angleTo(v2)
    }else{
      let lineAngle = v1.angleTo(v2) * 180 / Math.PI;
      if (v1.cross(v2).z < 0) {
        lineAngle = -lineAngle
      }
      return lineAngle;
    }

  }

  /**
   * 计算两条线的夹角，连续相邻折线
   */
  static getLinesAngle(l1x1: number, l1y1: number, l1x2: number, l1y2: number, l2x1: number, l2y1: number, l2x2: number, l2y2: number,radius:boolean = false):number{
    let vectorZero1 = new Vector3(1, 0, 0);
    let vectorZero2 = new Vector3(1, 0, 0);

    let vectorA = new Vector3(l1x1 - l1x2, l1y1 - l1y2, 0);

    let vectorB = new Vector3(l2x2 - l1x2, l2y2 - l1y2, 0);
    
    let angle1 = vectorZero1.angleTo(vectorA)// * 180 / Math.PI;
    if (vectorZero1.cross(vectorA).z < 0) {
      angle1 = -angle1
    }

    let angle2 = vectorZero2.angleTo(vectorB)// * 180 / Math.PI;
    if (vectorZero2.cross(vectorB).z < 0) {
      angle2 = -angle2
    }

    let ar1 = angle1
    let ar2 = angle2


    let angleRadians = ar2 - ar1
    if(!radius){
      angleRadians = angleRadians * 180 / Math.PI;
    }

    return angleRadians
    
  }

  /**
   * 根据Path获取JSON的数据
   * 如果data路径中存在override，则强制覆盖不从上级获取
   */
  static getDataByPath(data: object, path: string[]): { data: any, overwrite: boolean } {
    if (!path || path.length === 0) {
      return { 
        data: data,
        overwrite: data?.overwrite === true
      };
    }

    let currentData = data;
    let isOverwrite = false;

    for (let i = 0; i < path.length; i++) {
      const p = path[i];
      
      if (p.includes('[')) {
        // 处理数组索引
        const [arrayName, indexStr] = p.split('[');
        const index = parseInt(indexStr);
        if (!isNaN(index) && Array.isArray(currentData[arrayName])) {
          currentData = currentData[arrayName][index];
        } else {
          return { data: null, overwrite: false };
        }
      } else {
        currentData = currentData[p];
      }

      if (currentData == null) {
        return { data: null, overwrite: false };
      }

      if (currentData.overwrite === true) {
        isOverwrite = true;
      }
    }

    return {
      data: currentData,
      overwrite: isOverwrite
    };
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
    window.remRatio = window.rem > 168 ? window.rem / 168 : 1
    let ratio = (window.devicePixelRatio || 1) / backingStore;
    return ratio;
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
    hexNum = '0x' + (hexNum.length < 6 ? DDeiUtil.repeatLetter(hexNum, 2) : hexNum);
    let r = hexNum >> 16;
    let g = hexNum >> 8 & '0xff';
    let b = hexNum & '0xff';
    return `rgb(${r},${g},${b})`;
  }

  static hex2ddeicolor(hex: string): DDeiColor {
    let hexNum = hex.substring(1);
    hexNum = '0x' + (hexNum.length < 6 ? DDeiUtil.repeatLetter(hexNum, 2) : hexNum);
    let r = hexNum >> 16;
    let g = hexNum >> 8 & '0xff';
    let b = hexNum & '0xff';
    return new DDeiColor(r,g,b,1);
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
    if (color){
      color = color.trim()
      if (color.toLowerCase().startsWith("rgb")) {
        let rgb = color.split(',');
        let r = parseInt(rgb[0].split('(')[1]);
        let g = parseInt(rgb[1]);
        let b = parseInt(rgb[2].split(')')[0]);
        let hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        return hex;
      } else if (color.startsWith("#")) {
        return color
      }
      switch (color) {
        case "black": return "#000000";
        case "white": return "#FFFFFF";
        case "red": return "#FF0000";
        case "green": return "#00FF00";
        case "blue": return "#0000FF";
        case "grey": return "#808080";
        case "yellow": return "#FFFF00";
      }
    }
    return "";
  }

  // 将颜色转换为可用颜色(rgb),其他情况原样返回
  static getColor(color: string): string {
    if (!color) {
      return null;
    }
    if (typeof(color) == 'string' && color.startsWith("#")) {
      return DDeiUtil.hex2rgb(color);
    }
    //其余情况原样返回
    else {
      return color;
    }
  }
  

  // 将颜色转换为可用颜色(rgb),其他情况原样返回
  static getColorObj(color: string): DDeiColor|null {
    if (!color) {
      return null;
    }
    if (typeof (color) == 'string' && color.startsWith("#")) {
      return DDeiUtil.hex2ddeicolor(color);
    }
    //其余情况原样返回
    else {
      let hexColor = DDeiUtil.rgb2hex(color);
      return DDeiUtil.hex2ddeicolor(hexColor);
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
        let angle = DDeiUtil.preciseTimes(rotate, DDeiConfig.ROTATE_UNIT)
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
    let distType;
    if (dist){
      distType = typeof dist
    }
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
  static getReplacibleValue(model: object, keypath: string, format: boolean = false, replaceSPT: boolean = false, initData:object| null = null): any {
    //获取原始值
    if (model) {
      let hasTempSpt = false;
      let replaceDetail = null;
      let originValue = model?.render?.getCachedValue(keypath);
      if (!originValue && initData){
        //切分想要获取的属性层级
        let rp1 = keypath.split('.');
        if (rp1.length > 1){
          //属性详情路径code
          let detailCode = rp1.slice(1);
          let rd = DDeiUtil.getDataByPath(initData, detailCode);
          if(rd){
            originValue = rd.data
          }
        }
      }
      let returnValue = originValue;
      //执行值绑定替换
      if (originValue && originValue.indexOf("#") != -1) {
        //获取外部业务传入值
        let busiData = DDeiUtil.getBusiData(model.stage.ddInstance);
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
    // 去掉表达式中的空格
    expressContent = expressContent.replaceAll(" ", "");
    
    // 用正则进行拆分
    let expressArray = expressContent.split(contentSplitReg);
    
    if (expressArray != null && expressArray.length > 0) {
      // 循环对每一个子项进行求值
      for (let i = 0; i < expressArray.length; i++) {
        let ea = expressArray[i];
        let eaValue = this.calculExpressValue(ea, busiData, row);
        expressContent = expressContent.replaceAll(ea, eaValue);
      }
    }

    try {
      if (contentSplitReg.test(expressContent)) {
        expressContent = expressContent.replaceAll("null", "0");
        
        // 使用Function替代eval
        let result = new Function('return ' + expressContent)();
        return result;
      } else {
        return expressContent.replaceAll("null", "");
      }
    } catch (e) {
      console.error(e);
      return "";
    }
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
   */
  static analysisBindData(inputData, templateJSON) {
    // 将传入的数据与表格进行对比，根据是否分页打印对数据本身进行拆分
    let processDatas = inputData.flatMap(idata => this.analysisDataFromTemplate(idata, templateJSON));

    // 根据传入数据的数量，复制设计器，并替换里面的值
    return processDatas.map(idata => {
      let pdJSON = JSON.parse(JSON.stringify(templateJSON.toJSON()));
      
      // 处理水印
      this.processWatermark(pdJSON.pdPaper, idata);

      // 处理根模型
      for (let control of pdJSON.rootModels) {
        if (control.modelType === 'PDTable') {
          this.processTableControl(control, idata);
        } else if (control.modelType === 'PDImage') {
          this.processImageControl(control, idata);
        } else {
          this.processTextControl(control, idata);
        }
      }

      return pdJSON;
    });
  }

  // 处理水印
  static processWatermark(pdPaper, idata) {
    let watermarkReplaceData = this.processTextOrBindFieldExpress(pdPaper, idata);
    if (watermarkReplaceData) {
      pdPaper.watermarkBase64 = watermarkReplaceData;
      pdPaper.attrs['watermarkBase64'] = watermarkReplaceData;
      pdPaper.watermark = watermarkReplaceData;
      pdPaper.attrs['watermark'] = watermarkReplaceData;
      pdPaper.bindField = null;
      pdPaper.attrs['bindField'] = null;
    }
  }

  // 处理表格控件
  static processTableControl(table, idata) {
    // ... 表格处理逻辑 ...
  }

  // 处理图片控件  
  static processImageControl(control, idata) {
    let replaceData = this.processTextOrBindFieldExpress(control, idata);
    if (replaceData) {
      control.base64 = replaceData;
      control.attrs['base64'] = replaceData;
      control.src = replaceData;
      control.attrs['src'] = replaceData;
      control.bindField = null;
      control.attrs['bindField'] = null;
    }
  }

  // 处理文本控件
  static processTextControl(control, idata) {
    let replaceData = this.processTextOrBindFieldExpress(control, idata);
    control.text = replaceData;
    control.attrs['text'] = replaceData;
    control.bindField = null;
    control.attrs['bindField'] = null;
    control.convertToRMBY = '1';
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

  /**
   * 读取最近写入颜色
   */
  static readRecentlyChooseColors() {
    let colorStrs = DDeiUtil.getLocalStorageData("ddei-recently-choose-colors");
    if (colorStrs) {
      let colors = colorStrs.split(",")
      DDeiUtil.recentlyChooseColors = colors;
    }
  }

  /**
   * 写入最近选取颜色
   */
  static whiteRecentlyChooseColors(newValue) {
    if (!DDeiUtil.recentlyChooseColors) {
      DDeiUtil.recentlyChooseColors = []
    }
    if (DDeiUtil.recentlyChooseColors.indexOf(newValue) != -1) {
      DDeiUtil.recentlyChooseColors.splice(DDeiUtil.recentlyChooseColors.indexOf(newValue), 1)
    }

    DDeiUtil.recentlyChooseColors.splice(0, 0, newValue)

    if (DDeiUtil.recentlyChooseColors.length > 10) {
      DDeiUtil.recentlyChooseColors.splice(10, 1)
    }

    DDeiUtil.setLocalStorageData("ddei-recently-choose-colors", DDeiUtil.recentlyChooseColors.toString());
  }

  static canvasToImage(canvas): Promise {
    return new Promise((resolve, rejected) => {
      let dataURL = canvas.toDataURL("image/png");//转为base64格式的字符串
      let img = new Image()
      img.src = dataURL;
      img.onload = function () {
        resolve(img)
      }
      img.onerror = function () {
        rejected(img)
      }

    })
  }


  /**
   * 将当前实例的stage转换为image
   * @param ddInstance 
   * @param width 
   * @param height 
   */
  static stageScreenToImage(ddInstance, width, height) {
    return new Promise((resolve, rejected) => {
      try {
        //转换为图片
        let canvas = document.createElement('canvas');
        //获得 2d 上下文对象
        let ctx = canvas.getContext('2d');
        //获取缩放比例
        let rat1 = ddInstance.render.ratio
        let rat2 = Math.max(ddInstance.pixel,DDeiUtil.getPixelRatio(ctx));
        ddInstance.render.tempCanvas = canvas;
        //所选择区域的最大范围
        let models = ddInstance.stage.getLayerModels();
        let outRect = DDeiAbstractShape.getOutRectByPV(models);
        let lineOffset = models[0].render.getCachedValue("border.width");
        let addWidth = 0;
        if (lineOffset) {
          addWidth = lineOffset * rat1
          if (models.length > 1) {
            addWidth = lineOffset * 2
          }
        }
        let scaleW = 1, scaleH = 1
        if (outRect.width * rat1 > width * rat1) {
          scaleW = width / (outRect.width)
        }
        if (outRect.height * rat1 > height * rat1) {
          scaleH = height / (outRect.height)
        }
        canvas.setAttribute("style", "-webkit-font-smoothing:antialiased;-moz-transform-origin:left top;-moz-transform:scale(" + (1 / rat2) + ");display:block;-webkit-transform:scale(" + (1 / rat2)+")");
        if (scaleW != 1 || scaleH != 1) {
          canvas.setAttribute("width", width * rat1 + addWidth)
          canvas.setAttribute("height", height * rat1 + addWidth)
          ctx.translate(-outRect.x * rat1 * scaleW + addWidth / 2, -outRect.y * rat1 * scaleH + addWidth / 2)
          ctx.scale(scaleW, scaleH)
        } else {
          canvas.setAttribute("width", outRect.width * rat1 + addWidth)
          canvas.setAttribute("height", outRect.height * rat1 + addWidth)
          ctx.translate(-outRect.x * rat1 + addWidth / 2, -outRect.y * rat1 + addWidth / 2)
        }
        models.forEach(item => {
          item.render.drawShape();
        })
        let base64 = canvas.toDataURL("image/png")
        ddInstance.render.tempCanvas = null
        resolve(base64)
      } catch (e) {
        ddInstance.render.tempCanvas = null
        resolve('')
      }
    })
  }


  /**
   * 将当前实例的stage按一定大小比例剪切为多张图片
   */
  static async cutStageToImages(ddInstance, stage, width, height, sx, sy, ex, ey, scaleSize = 2, bg = false, mask = false, autoScale = false) {
    return new Promise((resolve, rejected) => {
      try {
        //转换为图片
        let canvas = document.createElement('canvas');
        //获得 2d 上下文对象
        let ctx = canvas.getContext('2d');
        //获取缩放比例
        let oldRat1 = ddInstance.render.ratio
        //如果高清屏，rat一般大于2印此系数为1保持不变，如果非高清则扩大为2倍保持清晰
        let rat1 = scaleSize ? scaleSize : oldRat1

        let stageRatio = stage.getStageRatio()
        ddInstance.render.tempCanvas = canvas;
        ddInstance.render.ratio = rat1
        //所选择区域的最大范围

        let editorId = DDeiUtil.getEditorId(ddInstance);
        let containerDiv = document.getElementById(editorId+"_ddei_cut_img_div")
        canvas.setAttribute("style", "-webkit-font-smoothing:antialiased;-moz-transform-origin:left top;-moz-transform:scale(" + (1 / rat1) + ");display:block;-webkit-transform:scale(" + (1 / rat1)+")");
        canvas.setAttribute("width", width * rat1)
        canvas.setAttribute("height", height * rat1)


        containerDiv.appendChild(canvas)
        let imagesBase64 = []
        let forceBreak = false;
        //输出canvas
        for (let i = sy; (ey > i || Math.abs((ey - height) - i) <= 0.01) && !forceBreak; i = i + height) {
          for (let j = sx; (ex > j || Math.abs((ex - width) - j) <= 0.01) && !forceBreak; j = j + width) {
            ctx.save();
            ctx.clearRect(0, 0, width * rat1, height * rat1)
            ctx.translate(-j * rat1, -i * rat1)

            //输出背景
            for (let li = stage.layers.length - 1; li >= 0; li--) {
              if (stage.layers[li].display == 1 && stage.layers[li].print != false) {
                //输出背景
                if (bg) {
                  stage.layers[li].render.drawBackground(sx * rat1, sy * rat1, (ex - sx) * rat1, (ey - sy) * rat1);
                }
              }
            }
            ctx.restore();
            ctx.save();


            //强制缩放
            if (autoScale) {

              //强制缩放，让所有内容都输出到当前单张纸张大小
              let models = stage.getLayerModels()
              let outRect = DDeiAbstractShape.getOutRectByPV(models)
              let scaleW = outRect.width / stageRatio / width
              let scaleH = outRect.height / stageRatio / height
              ctx.scale(1 / scaleW, 1 / scaleH)
              ctx.translate(-outRect.x * rat1 / stageRatio, -outRect.y * rat1 / stageRatio)



              //强制缩放只需要输出一次
              forceBreak = true
            } else {
              ctx.translate(-j * rat1, -i * rat1)
            }

            ctx.scale(1 / stageRatio, 1 / stageRatio)
            //输出各层的控件
            let hasPrint = true
            stage.render.selector.resetState()
            for (let li = stage.layers.length - 1; li >= 0; li--) {
              if (stage.layers[li].display == 1 && stage.layers[li].print != false) {
                stage.layers[li].opPoints = []
                delete stage.layers[li].opLine
                stage.layers[li].shadowControls?.forEach(c => {
                  c.destroyed()
                })
                stage.layers[li].shadowControls = []
                stage.layers[li].render.drawShape(false);
                hasPrint = true;
              }
            }

            ctx.restore()
            //输出水印
            if (mask) {
              ctx.save()
              ctx.scale(1 / stageRatio, 1 / stageRatio)
              stage.render.drawMark()
              ctx.restore()
            }
            if (hasPrint) {
              let base64 = canvas.toDataURL("image/png")
              imagesBase64.push(base64)
            }
          }
        }
        ddInstance.render.ratio = oldRat1
        ddInstance.render.tempCanvas = null
        containerDiv.removeChild(canvas)
        resolve(imagesBase64)
      } catch (e) {
        ddInstance.render.tempCanvas = null
        resolve('')
      }
    })
  }



  /**
   * 根据属性获取纸张大小
   */
  static getPaperSize(stage: DDeiStage, paperType: string,useRat:boolean = true): object {
    //纸张的像素大小
    let paperWidth = 0;
    let paperHeight = 0;
    //获取纸张大小的定义
    let paperInit
    if (stage.ddInstance.paper && typeof (stage.ddInstance.paper) == 'object') {
      paperInit = stage.ddInstance.paper;
    }
    if (!paperType) {
      paperType = DDeiModelArrtibuteValue.getAttrValueByState(stage, "paper.type", true, paperInit);
    }
    
    let paperConfig = DDeiConfig.PAPER[paperType];
    if (paperConfig) {
      let stageRatio = stage.getStageRatio()
      let ratio
      if (useRat){
        let rat1 = stage.render.ddRender.ratio;
        ratio = rat1 * stageRatio;
      }else{
        ratio = stageRatio;
      }
      let xDPI = stage.ddInstance.dpi.x;
      let paperDirect = DDeiModelArrtibuteValue.getAttrValueByState(stage, "paper.direct", true, paperInit);
      let w = paperConfig.width;
      let h = paperConfig.height;
      let unit = paperConfig.unit;
      if (paperType == '自定义') {
        //获取自定义属性以及单位
        let custWidth = DDeiModelArrtibuteValue.getAttrValueByState(stage, "paper.width", true, paperInit);
        if (custWidth || custWidth == 0) {
          w = custWidth;
        }
        let custHeight = DDeiModelArrtibuteValue.getAttrValueByState(stage, "paper.height", true, paperInit);
        if (custHeight || custHeight == 0) {
          h = custHeight;
        }
        let custUnit = DDeiModelArrtibuteValue.getAttrValueByState(stage, "paper.unit", true, paperInit);
        if (custUnit) {
          unit = custUnit;
        }
      }

      if (paperDirect == 1 || paperDirect == '1') {
        paperWidth = DDeiUtil.unitToPix(w, unit, xDPI) * ratio;
        paperHeight = DDeiUtil.unitToPix(h, unit, xDPI) * ratio;
      } else {
        paperHeight = DDeiUtil.unitToPix(w, unit, xDPI) * ratio;
        paperWidth = DDeiUtil.unitToPix(h, unit, xDPI) * ratio;
      }
    }
    return { width: paperWidth, height: paperHeight }
  }


  static dataURLtoBlob(dataurl) {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  /**
   * 将页面坐标（像素）转换为标尺坐标
   * @param point 转换的点
   * @param stage 舞台
   * @param unit 单位
   */
  static toRulerCoord(point: { x: number, y: number},stage: DDeiStage, unit:string): object{
    //生成文本并计算文本大小
    let stageRatio = stage.getStageRatio()
    let xDPI = stage.ddInstance.dpi.x;
    //标尺单位
    let rulerConfig = DDeiConfig.RULER[unit]
    //尺子间隔单位
    let unitWeight = DDeiUtil.unitToPix(rulerConfig.size, unit, xDPI);
    //基准每个部分的大小
    let marginWeight = unitWeight * stageRatio

    return { 
      x: (point.x - stage.spv.x) / marginWeight * rulerConfig.size, 
      y: (point.y - stage.spv.y) / marginWeight * rulerConfig.size,
      unit:unit
    };
  }


  /**
   * 将标尺坐标转换为页面坐标(像素)
   * @param point 转换的点
   * @param stage 舞台
   * @param unit 单位
   */
  static toPageCoord(point: { x: number, y: number }, stage: DDeiStage|object, unit: string): object {
    //生成文本并计算文本大小
    let stageRatio = stage?.ratio ? stage.ratio : stage.getStageRatio()
    let xDPI = stage.dpi ? stage.dpi : stage.ddInstance.dpi.x;
    //尺子间隔单位
    let unitWeight = DDeiUtil.unitToPix(1, unit, xDPI) * stageRatio;
    return {
      x: point.x * unitWeight  + (stage.spv ? stage.spv.x : 0),
      y: point.y * unitWeight  + (stage.spv ? stage.spv.y : 0)
    };
  }

  /**
   * 转换子元素的坐标
   * @param container 容器
   * @param stage  画布
   * @param unit  单位
   */
  static convertChildrenJsonUnit(model: object, stage: object, unit: string): void {
    if (model.cpv) {
      let cpv = DDeiUtil.toPageCoord({ x: model.cpv.x, y: model.cpv.y }, stage, unit)
      model.cpv.x = cpv.x
      model.cpv.y = cpv.y
    }

    if (model.bpv) {
      let bpv = DDeiUtil.toPageCoord({ x: model.bpv.x, y: model.bpv.y }, stage, unit)
      model.bpv.x = bpv.x
      model.bpv.y = bpv.y
    }
    if (model.hpv) {
      for (let k = 0; k < model.hpv.length; k++) {
        let hpv = DDeiUtil.toPageCoord({ x: model.hpv[k].x, y: model.hpv[k].y }, stage, unit)
        model.hpv[k].x = hpv.x
        model.hpv[k].y = hpv.y
      }
    }
    if (model.exPvs) {
      for (let k in model.exPvs) {
        let pv = DDeiUtil.toPageCoord({ x: model.exPvs[k].x, y: model.exPvs[k].y }, stage, unit)
        model.exPvs[k].x = pv.x
        model.exPvs[k].y = pv.y
      }
    }
    if (model.pvs) {
      for (let k = 0; k < model.pvs.length; k++) {
        let pv = DDeiUtil.toPageCoord({ x: model.pvs[k].x, y: model.pvs[k].y }, stage, unit)
        model.pvs[k].x = pv.x
        model.pvs[k].y = pv.y
      }
    }
    if (model.composes?.length > 0) {
      for (let k = 0; k < model.composes.length; k++) {
        DDeiUtil.convertChildrenJsonUnit(model.composes[k], stage, unit);
      }
    }

    if (model.midList) {
      for (let i = 0; i < model.midList.length; i++) {
        if (model.models[model.midList[i]]) {
          let subModel = model.models[model.midList[i]];
          //如果是容器则递归处理其子控件
          DDeiUtil.convertChildrenJsonUnit(subModel, stage, unit);
        }
      }
    }

  }

  static addLineLink(model, smodel, point, type):void {
    let pathPvs = smodel.pvs;
    let proPoints = DDeiAbstractShape.getProjPointDists(pathPvs, point.x, point.y, false, 1);
    let index = proPoints[0].index
    //计算当前path的角度（方向）angle和投射后点的比例rate
    let distance = DDeiUtil.getPointDistance(pathPvs[index].x, pathPvs[index].y, pathPvs[index + 1].x, pathPvs[index + 1].y)
    let sita = DDeiUtil.getLineAngle(pathPvs[index].x, pathPvs[index].y, pathPvs[index + 1].x, pathPvs[index + 1].y)
    let pointDistance = DDeiUtil.getPointDistance(pathPvs[index].x, pathPvs[index].y, proPoints[0].x, proPoints[0].y)
    let rate = pointDistance / distance
    rate = rate > 1 ? rate : rate
    //创建连接点
    let id = "_" + DDeiUtil.getUniqueCode()
    let dmpath
    if (type == 1) {
      dmpath = "startPoint"
      smodel.exPvs[id] = new Vector3(model.startPoint.x, model.startPoint.y, model.startPoint.z)
    } else if (type == 2) {
      dmpath = "endPoint"
      smodel.exPvs[id] = new Vector3(model.endPoint.x, model.endPoint.y, model.endPoint.z)
    }
    smodel.exPvs[id].rate = rate
    smodel.exPvs[id].sita = sita
    smodel.exPvs[id].index = index
    smodel.exPvs[id].id = id
    let link = new DDeiLink({
      sm: smodel,
      dm: model,
      smpath: "exPvs." + id,
      dmpath: dmpath,
      stage: model.stage
    });
    model.stage?.addLink(link)
    smodel.transVectors(new Matrix3())
    smodel.updateLinkModels();
    smodel.render?.enableRefreshShape()
  }

  /**
   * 删除对象的属性 
   * @param obj 对象
   * @param path 属性路径
   */
  static deletePropertyByPath(obj: any, path: string): void {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (current[parts[i]] === undefined) {
        return;
      }
      current = current[parts[i]];
    }
    delete current[parts[parts.length - 1]];
  }

  /**
   * 判断是否为移动端
   */
  static isMobile() {
    if(DDeiUtil.isMobileDevice == undefined){
      // 判断是否为移动设备
      if (DDeiUtil.isHarmonyOS()) {
        DDeiUtil.isMobileDevice = true;
      } else {
        DDeiUtil.isMobileDevice = (
          typeof window.orientation !== "undefined" || // 判断是否存在window.orientation属性，此属性在移动设备上一般存在
          navigator.userAgent.indexOf('IEMobile') !== -1 || // 判断是否为Windows Phone
          navigator.userAgent.indexOf('iPhone') !== -1 || // 判断是否为iPhone
          navigator.userAgent.indexOf('Android') !== -1 && navigator.userAgent.indexOf('Mobile') !== -1 || // 判断是否为Android手机
          navigator.userAgent.indexOf('BlackBerry') !== -1 || // 判断是否为BlackBerry
          navigator.userAgent.indexOf('Opera Mini') !== -1 // 判断是否为Opera Mini浏览器
        );
      }
    }
    return DDeiUtil.isMobileDevice;
    
  }

  /**
   * 判断是否为鸿蒙设备
   */
  static isHarmonyOS() {
    if (DDeiUtil.isHarmonyDevice == undefined) {
      let userAgent = navigator.userAgent || navigator.vendor || window.opera;
      DDeiUtil.isHarmonyDevice = userAgent.includes("HarmonyOS");
    }
    return DDeiUtil.isHarmonyDevice;
  }

  static isLandscape() {
    return (window.orientation || 0) === 90 || (window.orientation || 0) === -90;
  }

}



export {DDeiUtil}
export default DDeiUtil
