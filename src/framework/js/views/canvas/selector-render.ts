import DDeiConfig from '../../config.js';
import DDeiEnumBusCommandType from '../../enums/bus-command-type.js';
import DDeiEnumControlState from '../../enums/control-state.js';
import DDeiEnumOperateState from '../../enums/operate-state.js';
import DDeiModelArrtibuteValue from '../../models/attribute/attribute-value.js';
import DDeiAbstractShape from '../../models/shape.js';
import DDeiUtil from '../../util.js';
import DDeiRectangleCanvasRender from './rectangle-render.js';
import { Matrix3, Vector3 } from 'three';
import DDeiEnumOperateType from '../../enums/operate-type.js';

/**
 * DDeiSelector的渲染器类，用于渲染选择器
 */
class DDeiSelectorCanvasRender extends DDeiRectangleCanvasRender {
  constructor(props: object) {
    super(props)
    this.clip = false;
  }
  // ============================== 静态方法 ============================
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static newInstance(props: object): DDeiSelectorCanvasRender {
    return new DDeiSelectorCanvasRender(props)
  }

  // ============================== 属性 ===============================

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiSelectorCanvasRender";

  /**
   * 创建图形
   */
  drawShape(): void {
    //获得 2d 上下文对象
    let canvas = this.ddRender.getCanvas()
    let ctx = canvas.getContext('2d');
    //保存状态
    ctx.save();
    let models = null;
    if (this.stage?.selectedModels?.size > 0) {
      models = Array.from(this.stage.selectedModels.values())
    }
    if (this.stageRender.operateState == DDeiEnumOperateState.SELECT_WORKING) {
      
      this.stage?.layers[this.stage.layerIndex]?.render?.enableRefreshShape();
      //绘制边框
      this.drawBorder();

      //绘制边框上的操作图形
      // this.drawOperatorShape();
    } else if (this.stageRender.operateState != DDeiEnumOperateState.LINE_POINT_CHANGING) {
      if (models?.length == 1 && models[0]?.baseModelType == "DDeiLine") {
        //绘制线的选中效果
        this.drawLine();
        //绘制操作图形
        this.drawOperatorShapeLine();
      } else {
        if (models?.length == 1 && (models[0].mirrorX || models[0].mirrorY)){
          let model = models[0]
          let oldRat1 = this.ddRender.ratio * this.stage?.getStageRatio();
          ctx.translate(model.cpv.x * oldRat1, model.cpv.y * oldRat1)
          if (model.mirrorX) {
            ctx.scale(-1, 1)
          }
          if (model.mirrorY) {
            ctx.scale(1, -1)
          }
          ctx.translate(-model.cpv.x * oldRat1, -model.cpv.y * oldRat1)
        }
        if (this.stageRender.operateState == DDeiEnumOperateState.QUICK_EDITING || this.stageRender.operateState == DDeiEnumOperateState.QUICK_EDITING_TEXT_SELECTING) {
        //绘制编辑边框
        // this.drawEditBorder()
        } else {
          //绘制边框
          if (this.stage?.selectedModels?.size > 1) {
            
            this.drawBorder();
          }

          //绘制边框上的操作图形
          this.drawOperatorShape();

        }
      }


      //绘制特殊操作点
      this.drawOvsPoints();
    }
    //绘制选中控件特效
    this.drawIncludedStyle();

    ctx.restore();

  }


  /**
   * 绘制特殊操作点
   */
  drawOvsPoints(): void {
    if (this.model.state == DDeiEnumControlState.SELECTED && this.stage?.selectedModels?.size == 1) {
      let model = Array.from(this.stage?.selectedModels.values())[0]
      let ovs = model.ovs;
      if (ovs?.length > 0) {
        //获得 2d 上下文对象
        let canvas = this.ddRender.getCanvas()
        let ctx = canvas.getContext('2d');
        let ratio = this.ddRender.ratio * this.stage.getStageRatio();
        let weight = 4
        ctx.save();
        ctx.fillStyle = "yellow"
        ctx.strokeStyle = "black"
        let ovsDefine = DDeiUtil.getControlDefine(model)?.define?.ovs;
        for (let i = 0; i < ovs.length; i++) {
          let point = ovs[i]
          let pointDefine = ovsDefine[i]
          if (pointDefine?.constraint?.type && pointDefine.constraint.type != 5) {
            ctx.beginPath();
            ctx.moveTo((point.x + weight) * ratio, point.y * ratio)
            ctx.lineTo(point.x * ratio, (point.y + weight) * ratio)
            ctx.lineTo((point.x - weight) * ratio, point.y * ratio)
            ctx.lineTo(point.x * ratio, (point.y - weight) * ratio)
            ctx.closePath();
            ctx.stroke()
            ctx.fill();
          }
        }
        //恢复状态
        ctx.restore();
      }


    }



  }

  /**
   * 绘制编辑边框
   * @param tempBorder 临时边框，优先级最高
   * @param usePV 是否采用向量输出
   */
  drawEditBorder(): void {
    if (this.stageRender.editorShadowControl?.textArea?.length > 3) {
      //获得 2d 上下文对象
      let canvas = this.ddRender.getCanvas()
      let ctx = canvas.getContext('2d');
      ctx.save()
      //获取全局缩放比例
      let stageRatio = this.model.getStageRatio()
      let rat1 = this.ddRender.ratio;
      let ratio = rat1 * stageRatio;


      //偏移量，因为线是中线对齐，实际坐标应该加上偏移量
      let lineOffset = 0;//1 * ratio / 2;
      let lineWidth = 1.25 * ratio;

      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      //线段、虚线样式=
      ctx.setLineDash([10, 10]);
      //颜色
      ctx.strokeStyle = DDeiUtil.getColor("#017fff");
      let pvs = this.stageRender.editorShadowControl.textArea;
      if (pvs?.length > 0) {
        ctx.moveTo(pvs[0].x * rat1 + lineOffset, pvs[0].y * rat1 + lineOffset);
        ctx.lineTo(pvs[1].x * rat1 + lineOffset, pvs[1].y * rat1 + lineOffset);
        ctx.lineTo(pvs[2].x * rat1 + lineOffset, pvs[2].y * rat1 + lineOffset);
        ctx.lineTo(pvs[3].x * rat1 + lineOffset, pvs[3].y * rat1 + lineOffset);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }

  /**
   * 线模式下绘制线的效果
   */
  drawLine(): void {
    // if (this.stage?.selectedModels?.size > 0) {
    //   let lineModel = Array.from(this.stage?.selectedModels?.values())[0];
    //   if (lineModel.baseModelType == 'DDeiLine') {
    //     lineModel.render.drawLine({ color: "blue" });
    //   }
    // }

  }

  /**
   * 线模式下绘制线的操作图形
   */
  drawOperatorShapeLine(): void {
    if (this.model.state != DDeiEnumControlState.SELECTED) {
      return;
    }
    if (this.stage?.selectedModels?.size > 0) {
      let lineModel = Array.from(this.stage?.selectedModels?.values())[0];
      if (lineModel.baseModelType == 'DDeiLine') {
        let modeName = DDeiUtil.getConfigValue("MODE_NAME", this.ddRender.model);
        let accessLink = DDeiUtil.isAccess(
          DDeiEnumOperateType.LINK, [lineModel], null, modeName,
          this.ddRender.model
        );
        if (accessLink) {
          //获得 2d 上下文对象
          let canvas = this.ddRender.getCanvas()
          let ctx = canvas.getContext('2d');
          //获取全局缩放比例
          let stageRatio = this.stage.getStageRatio()
          let rat1 = this.ddRender.ratio;
          let ratio = rat1 * stageRatio;
          rat1 = ratio
          let pvs = lineModel.pvs
          let type = DDeiModelArrtibuteValue.getAttrValueByState(lineModel, "type", true);
          let weight = DDeiModelArrtibuteValue.getAttrValueByState(lineModel, "weight", true);
          let w10 = 1.3 * weight * ratio
          if (w10 > 5 * rat1) {
            w10 = 5 * rat1
          } else if (w10 < 2 * rat1) {
            w10 = 2 * rat1
          }

          let w15 = 1.5 * w10
          let w20 = 2 * w10
          let w30 = 2 * w15
          //保存状态
          ctx.save();
          // ctx.translate(rat1,rat1)
          switch (type) {
            case 1: {
              this.drawSEPoint(pvs, w10, w20, ctx, rat1, ratio)
              break;
            }
            case 2: {
              this.drawSEPoint(pvs, w10, w20, ctx, rat1, ratio)
              //根据中间节点绘制操作点
              ctx.strokeStyle = "#017fff";
              ctx.fillStyle = "white";
              for (let i = 1; i < pvs.length; i++) {
                if (i != pvs.length - 1) {
                  ctx.save()
                  let x1 = pvs[i].x * rat1;
                  let y1 = pvs[i].y * rat1;
                  if (lineModel.rotate) {
                    ctx.translate(x1, y1)
                    ctx.rotate(lineModel.rotate * DDeiConfig.ROTATE_UNIT);
                    ctx.translate(-x1, -y1)
                  }
                  ctx.fillRect(x1 - w15, y1 - w15, w30, w30)
                  ctx.strokeRect(x1 - w15, y1 - w15, w30, w30)
                  ctx.restore()
                }
                ctx.save()
                let x = (pvs[i].x + pvs[i - 1].x) / 2 * rat1
                let y = (pvs[i].y + pvs[i - 1].y) / 2 * rat1
                ctx.translate(x, y)
                ctx.rotate(((lineModel.rotate ? lineModel.rotate : 0) + 45) * DDeiConfig.ROTATE_UNIT);
                ctx.translate(-x, -y)
                //菱形
                ctx.fillRect(x - w10, y - w10, w20, w20)
                ctx.strokeRect(x - w10, y - w10, w20, w20)
                ctx.restore()
              }
              break;
            }
            case 3: {
              this.drawSEPoint(pvs, w10, w20, ctx, rat1, ratio)
              if (pvs.length >= 4) {
                ctx.strokeStyle = "#017fff";
                ctx.fillStyle = "white";
                for (let i = 1; i < this.model.opvs.length - 1; i++) {
                  let pv = this.model.opvs[i];
                  ctx.beginPath()
                  ctx.ellipse(pv.x * rat1, pv.y * rat1, w20, w20, 0, 0, DDeiUtil.PI2);
                  ctx.closePath()
                  ctx.fill();
                  ctx.stroke();
                }

              }
              break;
            }
          }

          //恢复状态
          ctx.restore();
        }
      
      }
    }

  }

  /**
   * 绘制开始和结束操作点
   */
  private drawSEPoint(pvs: object[], w10: number, w20: number, ctx: object, rat1: number, ratio: number): void {
    ctx.strokeStyle = "red";
    ctx.lineWidth = ratio
    ctx.fillStyle = "white";
    //白色打底
    ctx.beginPath()
    ctx.ellipse(pvs[0].x * rat1, pvs[0].y * rat1, w20, w20, 0, 0, DDeiUtil.PI2);
    ctx.closePath()
    ctx.fill();
    ctx.beginPath()
    ctx.ellipse(pvs[pvs.length - 1].x * rat1, pvs[pvs.length - 1].y * rat1, w20, w20, 0, 0, DDeiUtil.PI2);
    ctx.closePath()
    ctx.fill();
    //最里面红点
    ctx.fillStyle = "red";
    ctx.beginPath()
    ctx.ellipse(pvs[0].x * rat1, pvs[0].y * rat1, w10, w10, 0, 0, DDeiUtil.PI2);
    ctx.closePath()
    ctx.fill();
    ctx.beginPath()
    ctx.ellipse(pvs[pvs.length - 1].x * rat1, pvs[pvs.length - 1].y * rat1, w10, w10, 0, 0, DDeiUtil.PI2);
    ctx.closePath()
    ctx.fill();
    //最外层红线
    ctx.beginPath()
    ctx.ellipse(pvs[0].x * rat1, pvs[0].y * rat1, w20, w20, 0, 0, DDeiUtil.PI2);
    ctx.closePath()
    ctx.stroke();
    ctx.beginPath()
    ctx.ellipse(pvs[pvs.length - 1].x * rat1, pvs[pvs.length - 1].y * rat1, w20, w20, 0, 0, DDeiUtil.PI2);
    ctx.closePath()
    ctx.stroke();
  }



  /**
   * 获取边框上的操作图形
   * @param tempBorder 
   */
  drawOperatorShape(tempBorder: object | null): void {
    if (this.model.state != DDeiEnumControlState.SELECTED) {
      return;
    }
    //获得 2d 上下文对象
    let canvas = this.ddRender.getCanvas()
    let ctx = canvas.getContext('2d');
    //获取全局缩放比例
    let stageRatio = this.stage?.getStageRatio()
    let ratio = this.ddRender.ratio * stageRatio;
    //保存状态
    ctx.save();
    //设置旋转
    //操作图标的宽度
    let width = DDeiConfig.SELECTOR.OPERATE_ICON.weight * ratio;
    let halfWidth = width * 0.5;
    let selectedModels = this.stage?.selectedModels;
    if (selectedModels?.size > 0) {
      let firstModel = Array.from(selectedModels?.values())[0];
      for (let i = 1; i <= 10; i++) {
        //如果被选中，使用选中的边框，否则使用缺省边框
        let type = null;
        let color = null;
        let opacity = null;
        let bWidth = null;
        if (i <= 2 || i >= 9) {
          type = this.getBorderInfo(tempBorder, 1, "type");
          color = this.getBorderInfo(tempBorder, 1, "color");
          opacity = this.getBorderInfo(tempBorder, 1, "opacity");
          bWidth = this.getBorderInfo(tempBorder, 1, "width");
        } else if (i <= 4) {
          type = this.getBorderInfo(tempBorder, 2, "type");
          color = this.getBorderInfo(tempBorder, 2, "color");
          opacity = this.getBorderInfo(tempBorder, 2, "opacity");
          bWidth = this.getBorderInfo(tempBorder, 2, "width");
        } else if (i <= 6) {
          type = this.getBorderInfo(tempBorder, 3, "type");
          color = this.getBorderInfo(tempBorder, 3, "color");
          opacity = this.getBorderInfo(tempBorder, 3, "opacity");
          bWidth = this.getBorderInfo(tempBorder, 3, "width");
        } else if (i <= 8) {
          type = this.getBorderInfo(tempBorder, 4, "type");
          color = this.getBorderInfo(tempBorder, 4, "color");
          opacity = this.getBorderInfo(tempBorder, 4, "opacity");
          bWidth = this.getBorderInfo(tempBorder, 4, "width");
        }

        //如果边框未被disabled，则绘制边框
        if (!(type == 0 || type == '0') && color && (!opacity || opacity > 0) && bWidth > 0) {

          //偏移量，因为线是中线对齐，实际坐标应该加上偏移量
          let lineOffset = 0//bWidth * ratio / 2;
          ctx.lineWidth = bWidth * ratio;
          ctx.beginPath();

          //透明度
          if (opacity != null && opacity != undefined) {
            ctx.globalAlpha = opacity
          }
          //颜色
          ctx.strokeStyle = DDeiUtil.getColor(color);
          //填充操作图标的颜色
          let defaultFillColor = DDeiUtil.getColor(DDeiConfig.SELECTOR.OPERATE_ICON.FILL.default);
          ctx.fillStyle = defaultFillColor;


          //设置填充样式
          if (this.model.passIndex == i) {
            ctx.fillStyle = DDeiUtil.getColor(DDeiConfig.SELECTOR.OPERATE_ICON.FILL.pass);
          }
          let opvs = this.model.opvs;
          if (opvs?.length > 0) {

            if (i >= 1 && i <= 8) {
              if (opvs[i]) {
                ctx.ellipse(opvs[i].x * ratio + lineOffset, opvs[i].y * ratio + lineOffset, halfWidth, halfWidth, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
              }
            } else if (i == 9) {
              if (opvs[9]){
                if (this.model.passIndex == i) {
                  //填充一个圆形
                  ctx.ellipse(opvs[9].x * ratio + lineOffset, opvs[9].y * ratio + lineOffset, halfWidth, halfWidth, 0, 0, Math.PI * 2)
                  ctx.fill();
                } else {
                  //绘制旋转按钮
                  ctx.arc(opvs[9].x * ratio + lineOffset, opvs[9].y * ratio + lineOffset, halfWidth, 50, Math.PI * 1.6)
                  ctx.stroke()
                }
              }
            } else if (i == 10 && selectedModels.size == 1 && firstModel.baseModelType == 'DDeiTable') {

              ctx.fillStyle = DDeiUtil.getColor(color);
              //填充一个圆形
              ctx.ellipse(opvs[10].x * ratio + lineOffset, opvs[10].y * ratio + lineOffset, halfWidth, halfWidth, 0, 0, Math.PI * 2)
              ctx.fill();
            }
          }


        }
      }
    }
    //恢复状态
    ctx.restore();
  }

  /**
   * 获取边框信息
   * @param tempBorder 
   */
  getBorderInfo(tempBorder, direct, path): object {
    let borderInfo = null;
    if (tempBorder) {
      try {
        let returnJSON = DDeiUtil.getDataByPath(tempBorder, path.split('.'));
        borderInfo = returnJSON.data
      } catch (e) {

      }
    } else {
      borderInfo = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border" + "." + path, true);
    }
    return borderInfo;
  }


  /**
   * 计算除边框外的填充区域，用于填充颜色和字体
   */
  getFillArea(): object {
    //获取边框区域，实际填充区域=坐标-边框区域
    let disabled = this.getBorderInfo(null, 1, "disabled");
    let color = this.getBorderInfo(null, 1, "color");
    let opacity = this.getBorderInfo(null, 1, "opacity");
    let width = this.getBorderInfo(null, 1, "width");

    //计算填充的原始区域
    if (!(!disabled && color && (!opacity || opacity > 0) && width > 0)) {
      width = 0
    }
    let absBounds = this.model.getAbsBounds();
    let fillAreaE = {
      x: absBounds.x - width,
      y: absBounds.y - width,
      width: absBounds.width + 2 * width,
      height: absBounds.height + 2 * width
    }
    return fillAreaE;
  }

  /**
   * 绘制选中图形特效
   */
  drawIncludedStyle(): void {

    //选中被选择器包含的控件
    let includedModels: Map<string, DDeiAbstractShape> | null = null;
    let selectNumber = 0
    if (this.model.state == DDeiEnumControlState.DEFAULT) {
      includedModels = this.model.getIncludedModels();
    } else if (this.model.state == DDeiEnumControlState.SELECTED) {
      includedModels = this.stage?.selectedModels
      selectNumber = 1
    }
    this.upIncludeModels?.forEach(im => {
      im?.render?.enableRefreshShape()
    });
    if (includedModels && includedModels.size > selectNumber) {
      includedModels.forEach((model, key) => {
        //获得 2d 上下文对象
        let canvas = this.ddRender.getCanvas()
        let ctx = canvas.getContext('2d');
        //保存状态
        ctx.save();
        model.render.enableRefreshShape()
        if (model.baseModelType == "DDeiLine") {
          model.render.drawShape({ color: "red", dash: [] },0,null,99999);
        } else {
          //绘制临时Border
          model.render.drawShape({ type: 1, width: 1, color: "red", border: { type: 1,dash:[], width: 1, color: "red" } },0,null,99999);

        }
        ctx.restore()
      });
    }
    this.upIncludeModels = includedModels

  }

  /**
   * 鼠标移动事件，经由上层容器分发
   */
  mouseMove(evt: Event): void {
    let ex = evt.offsetX || evt.offsetX == 0 ? evt.offsetX : evt.touches[0].pageX;
    let ey = evt.offsetY || evt.offsetY == 0 ? evt.offsetY : evt.touches[0].pageY;
    ex /= window.remRatio
    ey /= window.remRatio
    ex -= this.stage.wpv.x;
    ey -= this.stage.wpv.y
    let stageRatio = this.stage?.getStageRatio();
    ex = ex / stageRatio
    ey = ey / stageRatio
    //判断当前坐标是否位于操作按钮上
    let models = null;
    if (this.stage?.selectedModels?.size > 0) {
      models = Array.from(this.stage.selectedModels.values())
    }
    //判定是否在特殊操作点上，特殊操作点的优先级最大
    let isOvPoint = false;
    if (models?.length == 1 && models[0]?.ovs.length > 0) {
      let ovPoint = models[0].getOvPointByPos(ex, ey)
      if (ovPoint) {
        let ovsDefine = DDeiUtil.getControlDefine(models[0])?.define?.ovs;
        let ovd = ovsDefine[models[0].ovs.indexOf(ovPoint)];
        if (ovd?.constraint?.type && ovd.constraint.type != 5) {
          isOvPoint = true;
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: "pointer" }, evt);
        }
      }
    }
    if (!isOvPoint) {
      if (models?.length == 1 && models[0]?.baseModelType == "DDeiLine") {
        let modeName = DDeiUtil.getConfigValue("MODE_NAME", this.ddRender.model);
        let accessLink = DDeiUtil.isAccess(
          DDeiEnumOperateType.LINK, [models[0]], null, modeName,
          this.ddRender.model
        );
        if (accessLink) {
          let tpdata = this.model.isOpvOnLine(ex, ey);

          if (tpdata) {
            //如果类型为3，需要计算方向
            let direct = null;
            if (tpdata.type == 3) {
              let beforeP = this.model.opvs[tpdata.index - 1]
              let afterP = this.model.opvs[tpdata.index + 1]
              //TODO 旋转的情况下，需要把旋转归0判断，x相等
              if (Math.abs(beforeP.x - afterP.x) <= 1) {
                direct = 2
              } else {
                direct = 1
              }
            }

            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { type: 'line', passIndex: tpdata.type, direct: direct, opvsIndex: tpdata.index }, evt);
            }
          
        } else {
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { type: 'line', passIndex: -1, opvsIndex: -1 }, evt);
        }
      } else {
        
        if (this.model.isOpvOn(1, ex, ey)) {
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: 1, opvsIndex: -1 }, evt);
        }
        //右上
        else if (this.model.isOpvOn(2, ex, ey)) {
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: 2, opvsIndex: -1 }, evt);
        }
        //右中
        else if (this.model.isOpvOn(3, ex, ey)) {
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: 3, opvsIndex: -1 }, evt);
        }
        //右下
        else if (this.model.isOpvOn(4, ex, ey)) {
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: 4, opvsIndex: -1 }, evt);
        }
        //中下
        else if (this.model.isOpvOn(5, ex, ey)) {
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: 5, opvsIndex: -1 }, evt);
        }
        //左下
        else if (this.model.isOpvOn(6, ex, ey)) {
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: 6, opvsIndex: -1 }, evt);
        }
        //左中
        else if (this.model.isOpvOn(7, ex, ey)) {
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: 7, opvsIndex: -1 }, evt);
        }
        //左上
        else if (this.model.isOpvOn(8, ex, ey)) {
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: 8, opvsIndex: -1 }, evt);
        }
        //旋转
        else if (this.model.isOpvOn(9, ex, ey)) {
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: 9, opvsIndex: -1 }, evt);
        }
        //拖拽点
        else if (this.model.isOpvOn(10, ex, ey)) {
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: 13, opvsIndex: -1 }, evt);
        } else {
          //判断是否在某个具体选中的控件上，如果是则分发事件
          let models = this.stage?.layers[this.stage?.layerIndex].findModelsByArea(ex, ey);
          if (models && models.length > 0) {
            //普通拖动
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: 10, opvsIndex: -1 }, evt);
          } else {
            //清空
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: -1, opvsIndex: -1 }, evt);
          }
        }
      }
    }
    this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape);
  }

  /**
  * 鼠标按下事件，经由上层容器分发
  */
  mouseDown(evt: Event): void {
    let ex = evt.offsetX || evt.offsetX == 0 ? evt.offsetX : evt.touches[0].pageX;
    let ey = evt.offsetY || evt.offsetY == 0 ? evt.offsetY : evt.touches[0].pageY;
    ex /= window.remRatio
    ey /= window.remRatio
    ex -= this.stage.wpv.x;
    ey -= this.stage.wpv.y
    let stageRatio = this.stage?.getStageRatio();
    ex = ex / stageRatio
    ey = ey / stageRatio
    //当前操作对象为线
    if (this.model.passType == 'line') {
      let lineModel = null;
      if (this.stage?.selectedModels?.size > 0) {
        let layer = this.stage.layers[this.stage?.layerIndex];
        lineModel = Array.from(this.stage.selectedModels.values())[0]
        let modeName = DDeiUtil.getConfigValue("MODE_NAME", this.ddRender.model);
        let accessLink = DDeiUtil.isAccess(
          DDeiEnumOperateType.LINK, [lineModel], null, modeName,
          this.ddRender.model
        );
        
        if (accessLink) {
          let dragPoint = this.model.opvs[this.model.opvsIndex]
          //创建影子控件
          let lineShadow = DDeiUtil.getShadowControl(lineModel);
          layer.shadowControls.push(lineShadow);
          this.stageRender.currentOperateShape = lineShadow
          this.stageRender.currentOperateShape.dragPoint = dragPoint
          
          let dragObj = {
            x: ex,
            y: ey,
            dragPoint: dragPoint,
            model: lineShadow,
            opvsIndex: this.model.opvsIndex,
            passIndex: this.model.passIndex,
            opvs: this.model.opvs
          }
          //加载事件的配置
          
          let rsState = DDeiUtil.invokeCallbackFunc("EVENT_LINE_DRAG_BEFORE", DDeiEnumOperateType.DRAG, dragObj, this.stage?.ddInstance, evt)
          if (rsState == 0 || rsState == 1) {
            DDeiUtil.invokeCallbackFunc("EVENT_MOUSE_OPERATING", DDeiEnumOperateType.LINK, null, this.stage?.ddInstance, evt)
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdateDragObj, { dragObj: dragObj }, evt);
            //改变光标
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: "grabbing" }, evt);

            this.stageRender.operateState = DDeiEnumOperateState.LINE_POINT_CHANGING
          }
        
        }
      }
    } else {
      //判断当前坐标是否位于操作按钮上,如果是则改变状态为响应状态
      if (this.model.passIndex >= 1 && this.model.passIndex <= 8) {
        let dragObj = {
          x: ex,
          y: ey,
          originData: {
            x: this.model.x,
            y: this.model.y,
            width: this.model.width,
            height: this.model.height
          }
        }
        //获取当前层次选择的控件
        //计算移动后的坐标以及大小
        let pContainerModel = this.stage.render.currentOperateContainer;
        if (!pContainerModel) {
          pContainerModel = this.stage.layers[this.stage.layerIndex]
        }
        let selectedModels = pContainerModel.getSelectedModels();
        let layer = this.stage.layers[this.stage.layerIndex]
        selectedModels.forEach(m => {
          let md = DDeiUtil.getShadowControl(m);
          layer.shadowControls.push(md);
        });
        this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdateDragObj, { dragObj: dragObj }, evt);
        //当前操作状态：改变控件大小中
        this.stageRender.operateState = DDeiEnumOperateState.CONTROL_CHANGING_BOUND

      }
      //旋转
      else if (this.model.passIndex == 9) {
        
        let pContainerModel = this.stageRender.currentOperateContainer;
        if (!pContainerModel) {
          pContainerModel = this.layer;
        }

        let selectedModels = pContainerModel.getSelectedModels();
        if (selectedModels) {
          if (selectedModels.set) {
            selectedModels = Array.from(selectedModels.values());
          }
          let stop = false;
          for (let i = 0; i < selectedModels.length; i++) {
            let parentContainer = selectedModels[i].pModel;
            if (parentContainer?.layoutManager) {
              if (!parentContainer.layoutManager.canChangeRotate()) {
                stop = true;
                break;
              }
            }
          }
          if (!stop){
            //获取当前元素的中心位置
            let dragObj = {
              x: ex,
              y: ey,
              cx: this.model.cpv.x,
              cy: this.model.cpv.y,
              models:selectedModels,
              container: pContainerModel
            }
            let rsState = DDeiUtil.invokeCallbackFunc("EVENT_CONTROL_ROTATE_BEFORE", DDeiEnumOperateType.ROTATE, { models: dragObj.models }, this.stage.ddInstance, evt)
            if (rsState == 0 || rsState == 1) {
              this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdateDragObj, { dragObj: dragObj }, evt);
              //当前操作状态：改变控件大小中
              this.stageRender.operateState = DDeiEnumOperateState.CONTROL_ROTATE
            }
          }
        }
      }
      //拖拽移动
      else if (this.model.passIndex == 13) {
        let selectedModels = this.stage?.selectedModels;
        //当前操作状态：控件拖拽中
        this.stageRender.operateState = DDeiEnumOperateState.CONTROL_DRAGING

        let layer = Array.from(selectedModels?.values())[0].layer;
        //清除临时操作点
        layer.opPoints = [];
        if (layer.opLine?.render) {
          layer.opLine.render.enableRefreshShape()
        }
        delete layer.opLine;
        //中心点坐标
        //当前控件的上层控件，可能是一个layer也可能是容器
        let centerPointVector = this.model.cpv;
        //记录当前的拖拽的x,y,写入dragObj作为临时变量
        let dragObj = {
          x: ex,
          y: ey,
          dx: centerPointVector.x - ex,//鼠标在控件中心坐标的增量位置
          dy: centerPointVector.y - ey,
        }

        //产生影子控件
        selectedModels.forEach(m => {
          let md = DDeiUtil.getShadowControl(m);
          layer.shadowControls.push(md);
          if (!this.stageRender.currentOperateShape) {
            this.stageRender.currentOperateShape = md;
          }
        });
        this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ModelChangeSelect, [{ id: this.stageRender.currentOperateShape.id, value: DDeiEnumControlState.SELECTED }], evt);
        this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdateDragObj, { dragObj: dragObj }, evt);
      }
      //记录当前拖拽状态
      if (this.model.passIndex != -1) {

      }
    }
  }


  /**
  * 计算移动后的坐标
  * @param x 
  * @param y
  * @param er 是否等比
  */
  getMovedBounds(x: number, y: number, er: boolean = false): object {
    let stageRatio = this.stage?.getStageRatio();
    let returnBounds = { x: this.model.x * stageRatio, y: this.model.y * stageRatio, width: this.model.width * stageRatio, height: this.model.height * stageRatio }
    //中心点
    let centerPointVector = this.model.cpv;
    //如果选择器存在旋转，则变换x，y到未旋转的预期位置上
    if (this.model.rotate) {
      let tempPV = new Vector3(x, y, 1)
      //计算input的正确打开位置，由节点0
      let move1Matrix = new Matrix3(
        1, 0, -centerPointVector.x,
        0, 1, -centerPointVector.y,
        0, 0, 1);
      let angle = (this.model.rotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
      let rotateMatrix = new Matrix3(
        Math.cos(angle), Math.sin(angle), 0,
        -Math.sin(angle), Math.cos(angle), 0,
        0, 0, 1);
      let move2Matrix = new Matrix3(
        1, 0, centerPointVector.x,
        0, 1, centerPointVector.y,
        0, 0, 1);
      let m1 = new Matrix3().premultiply(move1Matrix).premultiply(rotateMatrix).premultiply(move2Matrix);
      tempPV.applyMatrix3(m1)
      x = tempPV.x;
      y = tempPV.y
    }

    let wbh = returnBounds.width / returnBounds.height;

    //判定吸附
    let stage = this.model.stage
    //横纵吸附
    let hAds = stage.render.helpLines?.hAds || stage.render.helpLines?.hAds == 0 ? stage.render.helpLines?.hAds : Infinity
    let vAds = stage.render.helpLines?.vAds || stage.render.helpLines?.vAds == 0 ? stage.render.helpLines?.vAds : Infinity
    let hAdsValue = Infinity;
    let vAdsValue = Infinity;
    if (hAds != Infinity) {
      //退出吸附状态
      if (stage.render.isHAds && Math.abs(stage.render.hAdsY - y) > stage.ddInstance.GLOBAL_ADV_WEIGHT) {
        stage.render.isHAds = false
        stage.render.hAdsY = Infinity
      }
      //持续吸附状态
      else if (stage.render.isHAds) {
        hAdsValue = 0
      }
      //进入吸附状态
      else {
        stage.render.isHAds = true
        hAdsValue = -hAds
        stage.render.hAdsY = y
      }
    }
    if (vAds != Infinity) {

      //退出吸附状态
      if (stage.render.isVAds && Math.abs(stage.render.vAdsX - x) > stage.ddInstance.GLOBAL_ADV_WEIGHT) {
        stage.render.isVAds = false
        stage.render.vAdsX = Infinity
      }
      //持续吸附状态
      else if (stage.render.isVAds) {
        vAdsValue = 0;
      }
      //进入吸附状态
      else {
        stage.render.isVAds = true
        vAdsValue = -vAds
        stage.render.vAdsX = x
      }
    }


    switch (this.model.passIndex) {
      //上中
      case 1: {
        let dy = y - (centerPointVector.y - returnBounds.height / 2)
        if (hAdsValue != Infinity) {
          dy = hAdsValue
        }
        returnBounds.y = returnBounds.y + dy
        returnBounds.height = returnBounds.height - dy
        if (er) {
          returnBounds.x = returnBounds.x + dy * wbh / 2
          returnBounds.width = returnBounds.width - dy * wbh
        }
        break;
      }
      //上右
      case 2: {
        let dy = y - (centerPointVector.y - returnBounds.height / 2)
        let dx = x - centerPointVector.x - returnBounds.width / 2
        if (hAdsValue != Infinity) {
          dy = hAdsValue
        }
        if (vAdsValue != Infinity) {
          dx = vAdsValue
        }
        returnBounds.y = returnBounds.y + dy
        returnBounds.height = returnBounds.height - dy
        returnBounds.width = returnBounds.width + dx
        if (er) {
          returnBounds.x = returnBounds.x + dy * wbh / 2
          returnBounds.width = returnBounds.width - dy * wbh
          returnBounds.y = returnBounds.y - (dx / wbh / 2)
          returnBounds.height = returnBounds.height + (dx / wbh)
        }
        break;
      }
      //中右
      case 3: {

        let dx = x - centerPointVector.x - returnBounds.width / 2
        if (vAdsValue != Infinity) {
          dx = vAdsValue
        }
        returnBounds.width = returnBounds.width + dx



        if (er) {

          returnBounds.y = returnBounds.y - (dx / wbh / 2)
          returnBounds.height = returnBounds.height + (dx / wbh)
        }


        break;
      }
      //下右
      case 4: {
        let dx = x - centerPointVector.x - returnBounds.width / 2
        let dy = y - centerPointVector.y - returnBounds.height / 2
        if (hAdsValue != Infinity) {
          dy = hAdsValue
        }
        if (vAdsValue != Infinity) {
          dx = vAdsValue
        }
        returnBounds.width = returnBounds.width + dx
        returnBounds.height = returnBounds.height + dy
        if (er) {
          returnBounds.y = returnBounds.y - (dx / wbh / 2)
          returnBounds.height = returnBounds.height + (dx / wbh)
          returnBounds.x = returnBounds.x - dy * wbh / 2
          returnBounds.width = returnBounds.width + dy * wbh
        }
        break;
      }
      //下中
      case 5: {
        let dy = y - centerPointVector.y - returnBounds.height / 2
        if (hAdsValue != Infinity) {
          dy = hAdsValue
        }
        returnBounds.height = returnBounds.height + dy
        if (er) {
          returnBounds.x = returnBounds.x - dy * wbh / 2
          returnBounds.width = returnBounds.width + dy * wbh
        }
        break;
      }
      //下左
      case 6: {
        let dy = y - centerPointVector.y - returnBounds.height / 2
        let dx = -((centerPointVector.x - x) - returnBounds.width / 2)
        if (hAdsValue != Infinity) {
          dy = hAdsValue
        }
        if (vAdsValue != Infinity) {
          dx = vAdsValue
        }
        returnBounds.x = returnBounds.x + dx
        returnBounds.width = returnBounds.width - dx
        returnBounds.height = returnBounds.height + dy
        if (er) {
          returnBounds.x = returnBounds.x - dy * wbh / 2
          returnBounds.width = returnBounds.width + dy * wbh
          returnBounds.y = returnBounds.y + (dx / wbh / 2)
          returnBounds.height = returnBounds.height - (dx / wbh)
        }
        break;
      }
      //中左
      case 7: {
        let dx = -((centerPointVector.x - x) - returnBounds.width / 2)
        if (vAdsValue != Infinity) {
          dx = vAdsValue
        }
        returnBounds.x = returnBounds.x + dx
        returnBounds.width = returnBounds.width - dx
        if (er) {
          returnBounds.y = returnBounds.y + (dx / wbh / 2)
          returnBounds.height = returnBounds.height - (dx / wbh)
        }
        break;
      }
      //上左
      case 8: {
        let dy = y - (centerPointVector.y - returnBounds.height / 2)
        let dx = -((centerPointVector.x - x) - returnBounds.width / 2)
        if (hAdsValue != Infinity) {
          dy = hAdsValue
        }
        if (vAdsValue != Infinity) {
          dx = vAdsValue
        }
        returnBounds.x = returnBounds.x + dx
        returnBounds.width = returnBounds.width - dx
        returnBounds.y = returnBounds.y + dy
        returnBounds.height = returnBounds.height - dy
        if (er) {
          returnBounds.y = returnBounds.y + (dx / wbh / 2)
          returnBounds.height = returnBounds.height - (dx / wbh)
          returnBounds.x = returnBounds.x + dy * wbh / 2
          returnBounds.width = returnBounds.width - dy * wbh
        }
        break;
      }
      default: {
        break;
      }
    }


    return returnBounds;
  }


}
export { DDeiSelectorCanvasRender}
export default DDeiSelectorCanvasRender