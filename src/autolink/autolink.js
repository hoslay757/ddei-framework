/**
   * 计算自动连线的路径
   * @param sd 开始点信息，包含了点以及依附的外接矩形，以及开始的方向
   * @param ed 结束点信息，包含了点以及依附的外接矩形，以及结束的方向
   * @param obis 障碍物：包含了障碍物的外接点信息
   * @param extConfig 扩展信息，包含了参数以及推荐或强制路径，以改变寻路规则
   * @param extConfig.rectMidWeight 中间点权重，默认50
   * @param extConfig.forcePaths 强制路径：除非遇到障碍物，否则一定会经过的路径
   * @param extConfig.recommendPaths 推荐路径：根据点位关系生成的推荐路径
   * @param extConfig.recomWeight 推荐路径权重，默认100
   */
const calAutoLinePath = function (sd, ed, obis, extConfig) {
  if (!sd.direct) {
    //开始方向和结束方向
    sd.direct = 3;
    switch (sd.angle) {
      case -90: sd.direct = 1; break;
      case 0: sd.direct = 2; break;
      case 90: sd.direct = 3; break;
      case 180: sd.direct = 4; break;
    }
  }
  if (!ed.direct) {
    ed.direct = 1;
    switch (ed.angle) {
      case -90: ed.direct = 1; break;
      case 0: ed.direct = 2; break;
      case 90: ed.direct = 3; break;
      case 180: ed.direct = 4; break;
    }
  }

  if (!extConfig) {
    extConfig = {}
  }
  if (!extConfig.recomWeight) {
    extConfig.recomWeight = 100
  }
  if (!extConfig.rectMidWeight) {
    extConfig.rectMidWeight = 50
  }
  //所有障碍、开始、结束点外接矩形集合
  let outRects = []
  //延长线集合
  let extLines = []

  //1.根据交叉点生成寻路表格
  let corssPoints = []

  ed.point.isEnd = true
  sd.point.isStart = true

  corssPoints.push(sd.point)
  corssPoints.push(ed.point)

  genSEExtLine(sd, corssPoints, extLines)
  genSEExtLine(ed, corssPoints, extLines)
  //开始矩形和结束矩形的扩展点
  getAutoLineItemExtPoints(corssPoints, outRects, extLines, obis)
  //开始矩形和结束矩形的扩展点外接矩形之间的中心点
  for (let i = 0; i < outRects.length; i++) {
    let octi = outRects[i];
    for (let j = 1; j < outRects.length; j++) {
      let octj = outRects[j];
      if (i != j && octi.isStartOrEnd && octj.isStartOrEnd) {
        //上下
        if (octj.y1 < octi.y) {
          let mdy = octj.y1 + (octi.y - octj.y1) / 2
          extLines.push([{ x: octj.x - 50000, y: mdy, prio: extConfig?.rectMidWeight }, { x: octj.x + 50000, y: mdy }])
        }
        else if (octj.y > octi.y1) {
          let mdy = octi.y1 + (octj.y - octi.y1) / 2
          extLines.push([{ x: octj.x - 50000, y: mdy, prio: extConfig?.rectMidWeight }, { x: octj.x + 50000, y: mdy }])
        }
        //左右
        if (octj.x1 < octi.x) {
          let mdx = octj.x1 + (octi.x - octj.x1) / 2
          extLines.push([{ x: mdx, y: octj.y - 50000, prio: extConfig?.rectMidWeight }, { x: mdx, y: octj.y + 50000 }])
        }
        else if (octj.x > octi.x1) {
          let mdx = octi.x1 + (octj.x - octi.x1) / 2
          extLines.push([{ x: mdx, y: octj.y - 50000, prio: extConfig?.rectMidWeight }, { x: mdx, y: octj.y + 50000 }])
        }

      }

    }
  }

  //获取推荐路径，路径上所有点提高权限
  extConfig?.recommendPaths?.forEach(point => {
    if (point.type == 'x') {
      extLines.push([{ x: point.x, y: point.y - 50000, isRecommend: 1, prio: extConfig.recomWeight, color: "blue" }, { x: point.x, y: point.y + 50000 }])
    } else if (point.type == 'y') {
      extLines.push([{ x: point.x - 50000, y: point.y, isRecommend: 1, prio: extConfig.recomWeight, color: "blue" }, { x: point.x + 50000, y: point.y }])
    }
  })

  //获取强制路径，强制路径上所有点，拥有极高权限
  extConfig?.forcePaths?.forEach(point => {
    if (point.x) {
      extLines.push([{ x: point.x, y: point.y - 50000, isForce: 1, prio: 9999, color: "orange" }, { x: point.x, y: point.y + 50000 }])
    } else if (point.y) {
      extLines.push([{ x: point.x - 50000, y: point.y, isForce: 1, prio: 9999, color: "orange" }, { x: point.x + 50000, y: point.y }])
    }
  })

  //规则：根据点生成点的延长线以及延长线的交点
  for (let i = 0; i < extLines.length; i++) {
    let linei = extLines[i];
    let lineil = [linei[0]]
    if (linei[0].x == linei[1].x) {
      if (linei[0].y >= linei[1].y) {
        lineil.push({ x: linei[1].x, y: linei[1].y - 1000 })
      } else {
        lineil.push({ x: linei[1].x, y: linei[1].y + 1000 })
      }

    } else if (linei[0].y == linei[1].y) {
      if (linei[0].x >= linei[1].x) {
        lineil.push({ x: linei[1].x - 1000, y: linei[1].y })
      } else {
        lineil.push({ x: linei[1].x + 1000, y: linei[1].y })
      }
    }
    for (let j = i + 1; j < extLines.length; j++) {

      let linej = extLines[j];
      let linejl = [linej[0]]
      if (linej[0].x == linej[1].x) {
        if (linej[0].y >= linej[1].y) {
          linejl.push({ x: linej[1].x, y: linej[1].y - 1000 })
        } else {
          linejl.push({ x: linej[1].x, y: linej[1].y + 1000 })
        }

      } else if (linej[0].y == linej[1].y) {
        if (linej[0].x >= linej[1].x) {
          linejl.push({ x: linej[1].x - 1000, y: linej[1].y })
        } else {
          linejl.push({ x: linej[1].x + 1000, y: linej[1].y })
        }
      }

      let cp = getLineCorssPoint(lineil[0], lineil[1], linejl[0], linejl[1])
      if (cp) {
        cp.prio = (lineil[0].prio ? lineil[0].prio : 1) + (linejl[0].prio ? linejl[0].prio : 1)
        corssPoints.push(cp)
      }

    }
  }



  //利用所有点，生成寻路表格
  let yIntIndex = {}
  let xIntIndex = {}
  corssPoints.forEach(point => {
    let intX = parseInt(point.x);
    let intY = parseInt(point.y);
    if (!yIntIndex[intY]) {
      yIntIndex[intY] = []
    }
    let arr = yIntIndex[intY]
    let idx = -1;
    for (let i = 0; i < arr.length; i++) {
      if (intX < parseInt(arr[i].x)) {
        arr.splice(i, 0, point)
        idx = i
        break;
      } else if (intX == parseInt(arr[i].x)) {

        if (point.isStart)
          arr[i].isStart = point.isStart
        if (point.isEnd)
          arr[i].isEnd = point.isEnd
        if (point.prio) {
          arr[i].prio = (arr[i].prio ? arr[i].prio : 0) + point.prio
        }
        idx = i
        break;
      }
    }
    if (idx == -1) {
      arr.push(point)
    }
    if (!xIntIndex[intX]) {
      xIntIndex[intX] = []
    }
    arr = xIntIndex[intX]
    idx = -1;
    for (let i = 0; i < arr.length; i++) {
      if (intY < parseInt(arr[i].y)) {
        arr.splice(i, 0, point)
        idx = i
        break;
      } else if (intY == parseInt(arr[i].y)) {
        if (point.isStart)
          arr[i].isStart = point.isStart
        if (point.isEnd)
          arr[i].isEnd = point.isEnd
        if (point.prio) {
          arr[i].prio = (arr[i].prio ? arr[i].prio : 0) + point.prio
        }
        idx = i
        break;
      }
    }
    if (idx == -1) {
      arr.push(point)
    }
  })
  let successPaths = []
  //2.寻路,沿开始点，向开始方向开始寻路，横向用xIndex纵向用yIndex
  getLookForPath(null, sd.point, ed.point, 0, outRects, xIntIndex, yIntIndex, 0, 0, 'root', [], successPaths)

  //3.选择最佳路径，转弯较少>权重>路径长度>路径差异
  let minTurnNum = -1, minDistance = -1, maxPrio = 0
  let candidatePaths = []
  for (let i = 0; i < successPaths.length; i++) {
    if (minTurnNum == -1 || minTurnNum > successPaths[i].turnNum) {
      minTurnNum = successPaths[i].turnNum
      candidatePaths = [successPaths[i].pathPoints]
      minDistance = successPaths[i].distance
      maxPrio = successPaths[i].prio
    } else if (minTurnNum == successPaths[i].turnNum) {
      if (maxPrio < successPaths[i].prio) {
        minTurnNum = successPaths[i].turnNum
        candidatePaths = [successPaths[i].pathPoints]
        minDistance = successPaths[i].distance
        candidatePaths.push(successPaths[i].pathPoints)
        maxPrio = successPaths[i].prio
      } else if (maxPrio == successPaths[i].prio && parseInt(minDistance) > parseInt(successPaths[i].distance)) {
        minTurnNum = successPaths[i].turnNum
        candidatePaths = [successPaths[i].pathPoints]
        minDistance = successPaths[i].distance
        candidatePaths.push(successPaths[i].pathPoints)
      } else if (maxPrio == successPaths[i].prio && parseInt(minDistance) == parseInt(successPaths[i].distance)) {
        candidatePaths.push(successPaths[i].pathPoints)
      }
    }
  }
  let newPaths = []
  for (let i = 0; i < candidatePaths.length; i++) {
    let paths = candidatePaths[i]
    let upX = paths[0].x, upY = paths[0].y
    let upSX = paths[0].x, upSY = paths[0].y
    let newPath = [paths[0]], d = 0
    for (let j = 1; j < paths.length; j++) {
      let cp = paths[j]

      if (!d) {
        if (parseInt(cp.x) == parseInt(upSX) && parseInt(cp.y) == parseInt(upSY)) {

        }
        else if (parseInt(cp.x) == parseInt(upSX)) {
          d = 2
        } else if (parseInt(cp.y) == parseInt(upSY)) {
          d = 1
        }
      } else if (d == 1) {
        if (parseInt(cp.y) != parseInt(upSY)) {
          d = 2
          upSX = cp.x
          upSY = cp.y
          newPath.push({ x: upX, y: upY })
        }
      } else if (d == 2) {
        if (parseInt(cp.x) != parseInt(upSX)) {
          d = 1
          upSX = cp.x
          upSY = cp.y
          newPath.push({ x: upX, y: upY })
        }
      }
      upX = cp.x
      upY = cp.y
    }
    if (parseInt(upX) != parseInt(newPath[newPath.length - 1].x) || parseInt(upY) != parseInt(newPath[newPath.length - 1].y)) {
      newPath.push({ x: upX, y: upY })
    }
    newPaths.push(newPath)
  }
  let pathPoints = []
  if (newPaths.length > 0) {
    pathPoints = newPaths[0]
    let minDiff = Infinity, bestI = -1
    for (let i = 0; i < newPaths.length; i++) {
      let paths = newPaths[i]
      if (paths.length > 2) {
        //找到切割最均匀的路径,这里必然path>2
        let maxDiffY = 0, maxDiffX = 0
        //第一根线是横线还是竖线
        let d = parseInt(paths[0].x) == parseInt(paths[1].x) ? 2 : 1
        for (let j = 2; j < paths.length; j++) {
          //第一根线是竖线，比较y增量
          if (d == 2) {
            if (maxDiffY < Math.abs(paths[j - 2].y - paths[j].y)) {
              maxDiffY = Math.abs(paths[j - 2].y - paths[j].y)
            }
          }
          //比较横线
          else {
            if (maxDiffX < Math.abs(paths[j - 2].x - paths[j].x)) {
              maxDiffX = Math.abs(paths[j - 2].x - paths[j].x)
            }
          }
        }
        if (minDiff > maxDiffY + maxDiffX) {
          minDiff = maxDiffY + maxDiffX
          bestI = i
        }
      }
    }
    pathPoints = newPaths[bestI]
  }

  return { corssPoints: corssPoints, pathPoints: pathPoints, extLines: extLines }
}

/**
 * 执行单次，单方向寻路
 * @param upPoint 上一个节点，第一个节点传入null
 * @param curPoint 当前点
 * @param endPoint 结束点
 * @param fromDirect 来源方向，第一个节点传入0
 * @param outRects 障碍物外接矩形
 * @param xIntIndex x-y点索引
 * @param yIntIndex y-x点索引
 * @param turnNum 转弯次数
 * @param distance 距离
 * @param fullpath 当前的路径
 * @param successPaths 成功的路径
 */
const getLookForPath = function (upPoint, curPoint, endPoint, fromDirect, outRects, xIntIndex, yIntIndex, turnNum, distance, fullpath, passPoints, successPaths) {
  if (!curPoint) {
    return { state: -1, end: 1, fullpath: fullpath };
  }

  if (turnNum >= 5 || turnNum > endPoint.minTurnNum) {
    return { state: -1 };
  }
  let intX = parseInt(curPoint.x)
  let intY = parseInt(curPoint.y)

  if (isNaN(intX) || isNaN(intY)) {
    return { state: -1, end: 1, fullpath: fullpath };
  }
  //得到当前点在索引中的坐标
  let xyIndex = xIntIndex[intX].indexOf(curPoint)
  let yxIndex = yIntIndex[intY].indexOf(curPoint)

  /*
   * 对当前点进行判定
   * 1.当前节点超越了界限，查找失败
   * 2.当前点为查找目标节点，查找成功
   * 3.当前节点的四个方向均已关闭，终止查找
   * 4.检测是否遇到障碍，终止寻找
   * 5.除来源方向，其它方向的情况
   */
  //1.当前节点超越了界限，查找失败
  if (xyIndex == -1 || yxIndex == -1) {
    return { state: -1, end: 1, fullpath: fullpath };
  }
  else if (passPoints.indexOf(curPoint) != -1) {
    return { state: -1, end: 1, fullpath: fullpath };
  }


  //4.检测是否遇到障碍
  else if (upPoint) {
    let obiLine = { x1: parseInt(upPoint.x), y1: parseInt(upPoint.y), x2: intX, y2: intY }
    let isCorss = isCorssRect(obiLine, upPoint, curPoint, outRects)
    if (isCorss) {
      return { state: 0, close: 1, fullpath: fullpath };
    }
  } //2.当前节点已到达
  if (curPoint == endPoint || curPoint.isEnd || parseInt(endPoint.x) == intX && parseInt(endPoint.y) == intY) {
    endPoint.minTurnNum = Math.min(endPoint.minTurnNum ? endPoint.minTurnNum : 10, turnNum)
    let prio = 0
    passPoints.forEach(pt => {
      prio += pt.prio ? pt.prio : 0
    });
    successPaths.push({ fullpath: fullpath, turnNum, distance: distance, prio: prio, pathPoints: [...passPoints, curPoint] })
    return { state: 1, end: 1, fullpath: fullpath };
  }

  //5.除来源方向，其它方向的情况

  //关闭来源方向
  // switch (fromDirect) {
  //   case 1: curPoint.upClose = 1; break;
  //   case 2: curPoint.rightClose = 1; break;
  //   case 3: curPoint.downClose = 1; break;
  //   case 4: curPoint.leftClose = 1; break;
  // }
  //寻找不同来源方向的下一个节点
  let upClose, rightClose, downClose, leftClose
  if (!curPoint.upClose) {
    let nextPointXYIndex = xyIndex - 1
    if (nextPointXYIndex < 0) {
      curPoint.upClose = 1
      upClose = 1
    } else {
      let nextPoint = xIntIndex[intX][nextPointXYIndex]
      //下一次转弯值
      let nextTurnNum = fromDirect == 0 || fromDirect == 3 ? turnNum : turnNum + 1
      let nextDistance = distance + (nextPoint ? Math.abs(nextPoint.y - intY) : 0)
      let nextPointResult = getLookForPath(curPoint, nextPoint, endPoint, 3, outRects, xIntIndex, yIntIndex, nextTurnNum, nextDistance, fullpath + "-up", [...passPoints, curPoint], successPaths)
      if (nextPointResult?.close == 1 || nextPointResult?.state == -1) {
        upClose = 1
      }
    }
  } else {
    upClose = 1
  }
  //向下寻路
  if (!curPoint.downClose) {
    let nextPointXYIndex = xyIndex + 1
    if (nextPointXYIndex >= xIntIndex[intX].length) {
      curPoint.downClose = 1
      downClose = 1
    } else {
      let nextPoint = xIntIndex[intX][nextPointXYIndex]
      //下一次转弯值
      let nextTurnNum = fromDirect == 0 || fromDirect == 1 ? turnNum : turnNum + 1
      let nextDistance = distance + (nextPoint ? Math.abs(nextPoint.y - intY) : 0)
      let nextPointResult = getLookForPath(curPoint, nextPoint, endPoint, 1, outRects, xIntIndex, yIntIndex, nextTurnNum, nextDistance, fullpath + "-down", [...passPoints, curPoint], successPaths)
      if (nextPointResult?.close == 1 || nextPointResult?.state == -1) {
        downClose = 1
      }
    }
  } else {
    downClose = 1
  }

  //向左寻路
  if (!curPoint.leftClose) {
    let nextPointYXIndex = yxIndex - 1
    if (nextPointYXIndex >= yIntIndex[intY].length) {
      curPoint.leftClose = 1
      leftClose = 1
    } else {
      let nextPoint = yIntIndex[intY][nextPointYXIndex]
      //下一次转弯值
      let nextTurnNum = fromDirect == 0 || fromDirect == 2 ? turnNum : turnNum + 1
      let nextDistance = distance + (nextPoint ? Math.abs(nextPoint.x - intX) : 0)
      let nextPointResult = getLookForPath(curPoint, nextPoint, endPoint, 2, outRects, xIntIndex, yIntIndex, nextTurnNum, nextDistance, fullpath + "-left", [...passPoints, curPoint], successPaths)
      if (nextPointResult?.close == 1 || nextPointResult?.state == -1) {
        leftClose = 1
      }
    }
  } else {
    leftClose = 1
  }

  //向右寻路
  if (!curPoint.rightClose) {
    let nextPointYXIndex = yxIndex + 1
    if (nextPointYXIndex >= yIntIndex[intY].length) {
      curPoint.rightClose = 1
      rightClose = 1
    } else {

      let nextPoint = yIntIndex[intY][nextPointYXIndex]
      let nextTurnNum = fromDirect == 0 || fromDirect == 4 ? turnNum : turnNum + 1
      let nextDistance = distance + (nextPoint ? Math.abs(nextPoint.x - intX) : 0)
      let nextPointResult = getLookForPath(curPoint, nextPoint, endPoint, 4, outRects, xIntIndex, yIntIndex, nextTurnNum, nextDistance, fullpath + "-right", [...passPoints, curPoint], successPaths)
      if (nextPointResult?.close == 1 || nextPointResult?.state == -1) {
        rightClose = 1
      }
    }
  } else {
    rightClose = 1
  }

  if (upClose && downClose && leftClose && rightClose) {
    return { state: -1, close: 1, fullpath: fullpath };
  }

  return { state: 0, fullpath: fullpath };
}


//生成起点、终点的延长线
const genSEExtLine = function (ed, corssPoints, extLines) {
  switch (ed.direct) {
    case 1:
      corssPoints.push({ x: ed.point.x, y: ed.point.y - (ed.rect?.height > 0 ? ed.rect.height / 4 : 50) })
      extLines.push([{ x: ed.point.x, y: ed.point.y }, { x: ed.point.x, y: ed.point.y - 50000 }])
      if (!ed.rect) {
        extLines.push([{ x: ed.point.x - 50000, y: ed.point.y }, { x: ed.point.x + 50000, y: ed.point.y }])
      }
      break;
    case 2:
      corssPoints.push({ y: ed.point.y, x: ed.point.x + (ed.rect?.width > 0 ? ed.rect.width / 4 : 50) })
      extLines.push([{ x: ed.point.x, y: ed.point.y }, { x: ed.point.x + 50000, y: ed.point.y }])
      if (!ed.rect) {
        extLines.push([{ x: ed.point.x, y: ed.point.y - 50000 }, { x: ed.point.x, y: ed.point.y + 50000 }])
      }
      break;
    case 3:
      corssPoints.push({ x: ed.point.x, y: ed.point.y + (ed.rect?.height > 0 ? ed.rect.height / 4 : 50) })
      extLines.push([{ x: ed.point.x, y: ed.point.y }, { x: ed.point.x, y: ed.point.y + 50000 }])
      if (!ed.rect) {
        extLines.push([{ x: ed.point.x - 50000, y: ed.point.y }, { x: ed.point.x + 50000, y: ed.point.y }])
      }
      break;
    case 4:
      corssPoints.push({ y: ed.point.y, x: ed.point.x - (ed.rect?.width > 0 ? ed.rect.width / 4 : 50) })
      extLines.push([{ x: ed.point.x, y: ed.point.y }, { x: ed.point.x - 50000, y: ed.point.y }])
      if (!ed.rect) {
        extLines.push([{ x: ed.point.x, y: ed.point.y - 50000 }, { x: ed.point.x, y: ed.point.y + 50000 }])
      }
      break;
  }
}

/**
 * 返回某个点，相对于该图形的角度
 */
const getPointAngleByDirect = function (item) {
  switch (item.direct) {
    case 1: return -90;
    case 2: return 0;
    case 3: return 90;
    case 4: return 180;
  }
}

//获取元素的扩展点以及延长线
const getAutoLineItemExtPoints = function (corssPoints, outRects, extLines, dbis) {
  //外接矩形扩展区域大小
  let outRectExtRate = 0.25
  dbis.forEach(dbi => {
    let outRect = pvsToOutRect(dbi.points)
    if (dbi.isStartOrEnd) {
      outRect.isStartOrEnd = true
      let perWidth = outRect.width * outRectExtRate
      let perHeight = outRect.height * outRectExtRate
      dbi.points.forEach(point => {
        corssPoints.push({ x: point.x, y: point.y })
      });
      //左边
      corssPoints.push({ x: outRect.x - perWidth, y: outRect.y })
      corssPoints.push({ x: outRect.x - perWidth, y: outRect.y + outRect.height * 0.5 })
      corssPoints.push({ x: outRect.x - perWidth, y: outRect.y1 })

      extLines.push([{ x: outRect.x - perWidth, y: outRect.y - 50000 }, { x: outRect.x - perWidth, y: outRect.y + 50000 }])
      extLines.push([{ x: outRect.x, y: outRect.y }, { x: outRect.x - perWidth, y: outRect.y }])
      extLines.push([{ x: outRect.x, y: outRect.y + outRect.height * 0.5 }, { x: outRect.x - perWidth, y: outRect.y + outRect.height * 0.5 }])
      extLines.push([{ x: outRect.x, y: outRect.y1 }, { x: outRect.x - perWidth, y: outRect.y1 }])

      //右边
      corssPoints.push({ x: outRect.x1 + perWidth, y: outRect.y })
      corssPoints.push({ x: outRect.x1 + perWidth, y: outRect.y + outRect.height * 0.5 })
      corssPoints.push({ x: outRect.x1 + perWidth, y: outRect.y1 })

      extLines.push([{ x: outRect.x1 + perWidth, y: outRect.y - 50000 }, { x: outRect.x1 + perWidth, y: outRect.y + 50000 }])
      extLines.push([{ x: outRect.x1, y: outRect.y }, { x: outRect.x1 + perWidth, y: outRect.y }])
      extLines.push([{ x: outRect.x1, y: outRect.y + outRect.height * 0.5 }, { x: outRect.x1 + perWidth, y: outRect.y + outRect.height * 0.5 }])
      extLines.push([{ x: outRect.x1, y: outRect.y1 }, { x: outRect.x1 + perWidth, y: outRect.y1 }])
      //上边
      corssPoints.push({ x: outRect.x, y: outRect.y - perHeight })
      corssPoints.push({ x: outRect.x + outRect.width / 2, y: outRect.y - perHeight })
      corssPoints.push({ x: outRect.x1, y: outRect.y - perHeight })

      extLines.push([{ x: outRect.x - 50000, y: outRect.y - perHeight }, { x: outRect.x + 50000, y: outRect.y - perHeight }])
      extLines.push([{ x: outRect.x, y: outRect.y }, { x: outRect.x, y: outRect.y - perHeight }])
      extLines.push([{ x: outRect.x + outRect.width / 2, y: outRect.y }, { x: outRect.x + outRect.width / 2, y: outRect.y - perHeight }])
      extLines.push([{ x: outRect.x1, y: outRect.y }, { x: outRect.x1, y: outRect.y - perHeight }])



      //下边
      corssPoints.push({ x: outRect.x, y: outRect.y1 + perHeight })
      corssPoints.push({ x: outRect.x + outRect.width / 2, y: outRect.y1 + perHeight })
      corssPoints.push({ x: outRect.x1, y: outRect.y1 + perHeight })

      extLines.push([{ x: outRect.x - 50000, y: outRect.y1 + perHeight }, { x: outRect.x + 50000, y: outRect.y1 + perHeight }])
      extLines.push([{ x: outRect.x, y: outRect.y1 }, { x: outRect.x, y: outRect.y1 + perHeight }])
      extLines.push([{ x: outRect.x + outRect.width / 2, y: outRect.y1 }, { x: outRect.x + outRect.width / 2, y: outRect.y1 + perHeight }])
      extLines.push([{ x: outRect.x1, y: outRect.y1 }, { x: outRect.x1, y: outRect.y1 + perHeight }])
    }
    outRects.push(outRect)
  });
}

//碰撞检测
const isCorssRect = function (obiLine, spt, ept, outRects) {

  for (let o = 0; o < outRects.length; o++) {
    let outRect = outRects[o]
    let l2
    //上边线
    l2 = { x1: parseInt(outRect.x), y1: parseInt(outRect.y), x2: parseInt(outRect.x1), y2: parseInt(outRect.y) };
    if (isLineCross(obiLine, l2)) {
      if (!ept.isEnd && !spt.isStart) {
        return true
      } else {
        if (ept.isEnd && parseInt(ept.y) == l2.y2 && parseInt(spt.y) < l2.y2) {
        } else if (spt.isStart && parseInt(spt.y) == l2.y2 && parseInt(ept.y) < l2.y2) {
        } else {
          return true;
        }
      }
    }
    //下边线
    l2 = { x1: parseInt(outRect.x), y1: parseInt(outRect.y1), x2: parseInt(outRect.x1), y2: parseInt(outRect.y1) };
    if (isLineCross(obiLine, l2)) {
      if (!ept.isEnd && !spt.isStart) {
        return true
      } else {
        if (ept.isEnd && parseInt(ept.y) == l2.y2 && parseInt(spt.y) > l2.y2) {
        } else if (spt.isStart && parseInt(spt.y) == l2.y2 && parseInt(ept.y) > l2.y2) {
        } else {
          return true;
        }
      }
    }
    //左边线
    l2 = { x1: parseInt(outRect.x), y1: parseInt(outRect.y), x2: parseInt(outRect.x), y2: parseInt(outRect.y1) };
    if (isLineCross(obiLine, l2)) {
      if (!ept.isEnd && !spt.isStart) {
        return true
      } else {
        if (ept.isEnd && parseInt(ept.x) == l2.x2 && parseInt(spt.x) < l2.x2) {
        } else if (spt.isStart && parseInt(spt.x) == l2.x2 && parseInt(ept.x) < l2.x2) {
        } else {
          return true;
        }
      }
    }
    //右边线
    l2 = { x1: parseInt(outRect.x1), y1: parseInt(outRect.y), x2: parseInt(outRect.x1), y2: parseInt(outRect.y1) };
    if (isLineCross(obiLine, l2)) {
      if (!ept.isEnd && !spt.isStart) {
        return true
      } else {
        if (ept.isEnd && parseInt(ept.x) == l2.x2 && parseInt(spt.x) > l2.x2) {
        } else if (spt.isStart && parseInt(spt.x) == l2.x2 && parseInt(ept.x) > l2.x2) {
        } else {
          return true;
        }
      }
    }


  }
  return false;
}

/**
 * 判断两条线段是否相交
 * @param l1 线段1
 * @param l2 线段2
 * @returns 
 */
const isLineCross = function (l1, l2) {
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
const getLineCorssPoint = function (p1, p2, p3, p4) {

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
 * 求一个对变形的外接矩形
 * @param points 构成多边形的点
 */
const pvsToOutRect = function (points) {
  let x = Infinity, y = Infinity, x1 = -Infinity, y1 = -Infinity;
  //找到最大、最小的x和y
  points.forEach(p => {
    x = Math.min(p.x, x)
    x1 = Math.max(p.x, x1)
    y = Math.min(p.y, y)
    y1 = Math.max(p.y, y1)
  })
  return {
    x: x, y: y, width: x1 - x, height: y1 - y, x1: x1, y1: y1
  }
}

/**
  * 获取推荐的移动路径摘要
  * @param sAngle 开始点的角度
  * @param eAngle 结束点的角度
  * @param startPoint 开始点
  * @param endPoint 结束点
  */
const getMovePath = function (sAngle, eAngle, startPoint, endPoint) {
  let movePath = ""
  switch (sAngle) {
    //开始点为右边线的各种情况
    case 0: {
      switch (eAngle) {
        case 180: {
          //Y相等
          if (Math.abs(startPoint.y - endPoint.y) <= 1) {
            if (startPoint.x > endPoint.x) {
              movePath = "sx:0.25,ex:-0.25"
            }
          }
          //开始高于结束
          else if (startPoint.y > endPoint.y) {
            if (startPoint.x > endPoint.x) {
              movePath = "sx:0.25,ex:-0.25"
            }
          }
          //结束高于开始
          else {
            if (startPoint.x > endPoint.x) {
              movePath = "sx:0.25,ex:-0.25"
            }
          }
        } break;
        case -90: {
          //Y相等
          if (Math.abs(startPoint.y - endPoint.y) <= 1) {

          }
          //开始高于结束
          else if (startPoint.y > endPoint.y) {
            if (startPoint.x > endPoint.x) {
              movePath = "sx:0.25,ey:-0.25"
            }
            else {
              movePath = "ey:-0.25"
            }
          }
          //结束高于开始
          else {
            if (Math.abs(startPoint.x - endPoint.x) <= 1) {
              movePath = "sx:0.25"
            } else if (startPoint.x > endPoint.x) {
              movePath = "sx:0.25"
            }

          }
        } break;
        case 90: {
          //Y相等
          if (Math.abs(startPoint.y - endPoint.y) <= 1) {
            if (startPoint.x > endPoint.x) {
              movePath = "sx:0.25,sy2:0.25"
            } else {
              movePath = "ey:0.25"
            }
          }
          //开始高于结束
          else if (startPoint.y > endPoint.y) {
            if (Math.abs(startPoint.x - endPoint.x) <= 1) {
              movePath = "sx:0.25"
            } else if (startPoint.x > endPoint.x) {
              movePath = "sx:0.25"
            }
            else {

            }
          }
          //结束高于开始
          else {
            if (Math.abs(startPoint.x - endPoint.x) <= 1) {

            } else if (startPoint.x > endPoint.x) {
              movePath = "sx:0.25,ey:0.25"
            }
            else {
              movePath = "ey:0.25"
            }
          }
        }
          break;
        case 0: {
          //Y相等
          if (Math.abs(startPoint.y - endPoint.y) <= 1) {
            if (startPoint.x > endPoint.x) {
              movePath = "sx:0.25,sy1:-0.25"
            }
            else {
              movePath = "ey1:-0.25"
            }
          }
          //开始高于结束
          else if (startPoint.y > endPoint.y) {
            if (Math.abs(startPoint.x - endPoint.x) <= 1) {
              movePath = "sx:0.25"
            }
            else if (startPoint.x > endPoint.x) {
              movePath = "sx:0.25"
            }
            else {
              movePath = "ex:0.25"
            }
          }
          //结束高于开始
          else {
            if (Math.abs(startPoint.x - endPoint.x) <= 1) {
              movePath = "sx:0.25"
            }
            else if (startPoint.x > endPoint.x) {
              movePath = "sx:0.25"
            }
            else {
              movePath = "ex:0.25"
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
            }
            else {
              movePath = "sx:-0.25,ey1:-0.25,ex:0.25"
            }
          }
          //开始高于结束
          else if (startPoint.y > endPoint.y) {
            if (startPoint.x > endPoint.x) {

            }
            else {
              movePath = "sx:-0.25,ex:0.25"
            }
          }
          //结束高于开始
          else {
            if (startPoint.x > endPoint.x) {

            }
            else {
              movePath = "sx:-0.25,ex:0.25"
            }
          }
        }
          break;
        case -90: {
          //Y相等
          if (Math.abs(startPoint.y - endPoint.y) <= 1) {
            if (startPoint.x < endPoint.x) {
              movePath = "sx:-0.25,ry-s:-0.25"
            } else {
              movePath = "sx:-0.25,ry-s:-0.25"
            }
          }
          //开始高于结束
          else if (startPoint.y > endPoint.y) {
            if (startPoint.x > endPoint.x) {
              movePath = "sx:-0.25,ey:-0.25"
            }
            else {
              movePath = "sx:-0.25,ey:-0.25"
            }
          }
          //结束高于开始
          else {
            if (startPoint.x > endPoint.x) {

            }
            else {
              movePath = "sx:-0.25"
            }
          }
        }
          break;
        case 90: {
          //Y相等
          if (Math.abs(startPoint.y - endPoint.y) <= 1) {
            if (startPoint.x < endPoint.x) {
              movePath = "rx-s:-0.25,ry1-e:0.25"
            } else {
              movePath = "ey2:0.25"
            }
          }
          //开始高于结束
          else if (startPoint.y > endPoint.y) {
            if (Math.abs(startPoint.x - endPoint.x) <= 1) {

            } else if (startPoint.x > endPoint.x) {

            }
            else {
              movePath = "sx:-0.25"
            }
          }
          //结束高于开始
          else {
            if (Math.abs(startPoint.x - endPoint.x) <= 1) {
              movePath = "ex2:-0.25,ey2:0.25"
            }
            else if (startPoint.x > endPoint.x) {
              movePath = "ey:0.25"
            }
            else {
              movePath = "sx:-0.25,ey:0.25"
            }
          }
        } break;
        case 180: {
          //Y相等
          if (Math.abs(startPoint.y - endPoint.y) <= 1) {
            if (startPoint.x > endPoint.x) {
              movePath = "ey1:-0.25,ex:-0.25"
            } else {
              movePath = "sx:-0.25,ey1:-0.25"
            }

          }
          //开始高于结束
          else if (startPoint.y > endPoint.y) {
            if (Math.abs(startPoint.x - endPoint.x) <= 1) {
              movePath = "sx:-0.25"
            }
            else if (startPoint.x > endPoint.x) {
              movePath = "ex:-0.25"
            }
            else {
              movePath = "sx:-0.25"
            }
          }
          //结束高于开始
          else {
            if (Math.abs(startPoint.x - endPoint.x) <= 1) {
              movePath = "sx:-0.25"
            }
            else if (startPoint.x > endPoint.x) {
              movePath = "ex:-0.25"
            }
            else {
              movePath = "sx:-0.25"
            }
          }
        } break;
      }
    } break;
    case -90: {
      switch (eAngle) {
        //开始点为上边线的各种情况
        case 90:
          //OK
          {
            //Y相等
            if (Math.abs(startPoint.y - endPoint.y) <= 1) {
              movePath = "sy:-0.25,ey:0.25"
            }
            //开始高于结束
            else if (startPoint.y > endPoint.y) {

            }
            //结束高于开始
            else {
              if (Math.abs(startPoint.x - endPoint.x) <= 1) {
                movePath = "sy:-0.25,sx1:-0.25,ey:0.25"
              } else {
                movePath = "sy:-0.25,ey:0.25"
              }
            }
          }
          break;
        case 0: {
          //OK
          //Y相等
          if (Math.abs(startPoint.y - endPoint.y) <= 1) {
            if (startPoint.x > endPoint.x) {
              movePath = "sy:-0.25"
            }
            else {
              movePath = "sy:-0.25"
            }
          }
          //开始高于结束
          else if (startPoint.y > endPoint.y) {
            if (Math.abs(startPoint.x - endPoint.x) <= 1) {

            } else if (startPoint.x > endPoint.x) {

            }
            else {
              movePath = "ex:0.25"
            }
          }
          //结束高于开始
          else {
            if (Math.abs(startPoint.x - endPoint.x) <= 1) {
              movePath = "sy:-0.25,sx2:0.25"
            }
            else if (startPoint.x > endPoint.x) {
              movePath = "sy:-0.25,sx2:0.25"
            }
            else {
              movePath = "sy:-0.25,ex:0.25"
            }
          }
        }
          break;
        case 180: {
          //Y相等
          if (Math.abs(startPoint.y - endPoint.y) <= 1) {
            if (startPoint.x > endPoint.x) {
              movePath = "sy:-0.25"
            }
            else {
              movePath = "sy:-0.25"
            }
          }
          //开始高于结束
          else if (startPoint.y > endPoint.y) {
            if (Math.abs(startPoint.x - endPoint.x) <= 1) {
              movePath = "sx:-0.25"
            } else if (startPoint.x > endPoint.x) {
              movePath = "ex:-0.25"
            }
            else {

            }
          }
          //结束高于开始
          else {
            if (Math.abs(startPoint.x - endPoint.x) <= 1) {
              movePath = "sy:-0.25,rx-s:-0.25"
            }
            else if (startPoint.x > endPoint.x) {
              movePath = "sy:-0.25,ex:-0.25"
            }
            else {
              movePath = "sy:-0.25"
            }
          }
        }
          break;
        case -90:
          //OK
          {
            //Y相等
            if (Math.abs(startPoint.y - endPoint.y) <= 1) {
              movePath = "sy:-0.25,ex:0"
            }
            //开始高于结束
            else if (startPoint.y > endPoint.y) {
              if (Math.abs(startPoint.x - endPoint.x) <= 1) {
                movePath = "ey:-0.25"
              } else if (startPoint.x > endPoint.x) {
                movePath = "ey:-0.25,ex:0"
              }
              else {
                movePath = "ey:-0.25,ex:0"
              }
            }
            //结束高于开始
            else {
              if (Math.abs(startPoint.x - endPoint.x) <= 1) {
                movePath = "sx1:-0.25,eymid"
              }
              else if (startPoint.x > endPoint.x) {
                movePath = "sy:-0.25,ex:0"
              }
              else {
                movePath = "sy:-0.25,ex:0"
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
          //OK
          //Y相等
          if (Math.abs(startPoint.y - endPoint.y) <= 1) {
            if (startPoint.x > endPoint.x) {
              movePath = "sy:0.25,ey:-0.25"
            }
            else {
              movePath = "sy:0.25,ey:-0.25"
            }
          }
          //开始高于结束
          else if (startPoint.y > endPoint.y) {
            if (Math.abs(startPoint.x - endPoint.x) <= 1) {
              movePath = "sy:0.25,ey:-0.25"
            } else if (startPoint.x > endPoint.x) {
              movePath = "sy:0.25,ey:-0.25"
            }
            else {
              movePath = "sy:0.25,ey:-0.25"
            }
          }
          //结束高于开始
          else {

          }
        } break;
        case 0: {
          //OK
          //Y相等
          if (Math.abs(startPoint.y - endPoint.y) <= 1) {
            movePath = "sy:0.25"
          }
          //开始高于结束
          else if (startPoint.y > endPoint.y) {
            if (Math.abs(startPoint.x - endPoint.x) <= 1) {
              movePath = "sy:0.25,ex:0.25"
            } else if (startPoint.x > endPoint.x) {
              movePath = "sy:0.25"
            }
            else {
              movePath = "sy:0.25,ex:0.25"
            }
          }
          //结束高于开始
          else {
            if (Math.abs(startPoint.x - endPoint.x) <= 1) {

            }
            else if (startPoint.x > endPoint.x) {

            }
            else {
              movePath = "ex:0.25"
            }
          }
        } break;
        case 180: {
          //Y相等
          if (Math.abs(startPoint.y - endPoint.y) <= 1) {
            movePath = "sy:0.25"
          }
          //开始高于结束
          else if (startPoint.y > endPoint.y) {
            if (Math.abs(startPoint.x - endPoint.x) <= 1) {
            } else if (startPoint.x > endPoint.x) {
              movePath = "sy:0.25,ex:-0.25"
            }
            else {
              movePath = "sy:0.25"
            }
          }
          //结束高于开始
          else {
            if (startPoint.x > endPoint.x) {
              movePath = "ex:-0.25"
            }
          }
        } break;
        case 90: {
          //OK
          //Y相等
          if (Math.abs(startPoint.y - endPoint.y) <= 1) {
            movePath = "sy:0.25"
          }
          //开始高于结束
          else if (startPoint.y > endPoint.y) {
            if (Math.abs(startPoint.x - endPoint.x) <= 1) {
              movePath = "sy:0.25,sx1:-0.25"
            } else if (startPoint.x > endPoint.x) {
              movePath = "sy:0.25"
            }
            else {
              movePath = "sy:0.25"
            }
          }
          //结束高于开始
          else {
            if (Math.abs(startPoint.x - endPoint.x) <= 1) {
              movePath = "ex2:0.25,ey:0.25"
            }
            else if (startPoint.x > endPoint.x) {
              movePath = "ey:0.25"
            }
            else {
              movePath = "ey:0.25"
            }
          }
        } break;
      }
    } break;
  }

  return movePath;
}

/**
  * 获取推荐的移动路径
  * @param sAngle 开始点的角度
  * @param eAngle 结束点的角度
  * @param startPoint 开始点
  * @param endPoint 结束点
  * @param startRect 开始点
  * @param endRect 结束点
  * @return 推荐的路径点
  */
const getRecommendPath = function (sAngle, eAngle, startPoint, endPoint, startRect, endRect) {
  let recommendPaths = []
  let movePath = getMovePath(sAngle, eAngle, startPoint, endPoint, startRect, endRect)
  if (movePath) {
    let mPaths = movePath.split(",")
    mPaths.forEach(mPath => {
      let mpa = mPath.split(":");
      let opType = mpa[0];
      let opSize = parseFloat(mpa[1]);
      let cPoint = {}
      switch (opType) {
        case 'sx':
          cPoint.x = startPoint.x + opSize * startRect.width
          cPoint.y = startPoint.y
          cPoint.type = 'x'
          break;
        case 'sy':
          cPoint.y = startPoint.y + opSize * startRect.height
          cPoint.x = startPoint.x
          cPoint.type = 'y'
          break;
        case 'ex':
          cPoint.x = endPoint.x + opSize * endRect.width
          cPoint.y = endPoint.y
          cPoint.type = 'x'
          break;

        case 'sxmid':
          cPoint.y = startPoint.y
          if (outRect) {
            cPoint.x = outRect.x + outRect.width / 2
          } else {
            cPoint.x = (startPoint.x + endPoint.x) / 2
          }
          cPoint.type = 'x'
          break;
        case 'symid':
          cPoint.x = startPoint.x
          if (outRect) {
            cPoint.y = outRect.y + outRect.height / 2
          } else {
            cPoint.y = (startPoint.y + endPoint.y) / 2
          }
          cPoint.type = 'y'
          break;
        case 'exmid':
          cPoint.y = endPoint.y
          if (outRect) {
            cPoint.x = outRect.x + outRect.width / 2
          } else {
            cPoint.x = (startPoint.x + endPoint.x) / 2
          }
          cPoint.type = 'x'
          break;
        case 'eymid':
          cPoint.x = endPoint.x
          if (outRect) {
            cPoint.y = outRect.y + outRect.height / 2
          } else {
            cPoint.y = (endPoint.y + endPoint.y) / 2
          }
          cPoint.type = 'y'
          break;
        case 'sx1':
          cPoint.y = startPoint.y
          cPoint.x = startRect.x + startRect.width * opSize
          cPoint.type = 'x'
          break;
        case 'sx2':
          cPoint.y = startPoint.y
          cPoint.x = startRect.x1 + startRect.width * opSize
          cPoint.type = 'x'
          break;
        case 'ex1':
          cPoint.y = endPoint.y
          cPoint.x = endRect.x + endRect.width * opSize
          cPoint.type = 'x'
          break;
        case 'ex2':
          cPoint.y = endPoint.y
          cPoint.x = endRect.x1 + endRect.width * opSize
          cPoint.type = 'x'
          break;
        case 'sy1':
          cPoint.x = startPoint.x
          cPoint.y = startRect.y + startRect.height * opSize
          cPoint.type = 'y'
          break;
        case 'sy2':
          cPoint.x = startPoint.x
          cPoint.y = startRect.y1 + startRect.height * opSize
          cPoint.type = 'y'
          break;
        case 'ey':
          cPoint.y = endPoint.y + opSize * endRect.height
          cPoint.x = endPoint.x
          cPoint.type = 'y'
          break;
        case 'ey1':
          cPoint.x = endPoint.x
          cPoint.y = endRect.y + endRect.height * opSize
          cPoint.type = 'y'
          break;
        case 'ey2':
          cPoint.x = endPoint.x
          cPoint.y = endRect.y1 + endRect.height * opSize
          cPoint.type = 'y'
          break;
        case 'rx-s':
          if (outRect) {
            cPoint.x = outRect.x + startRect.width * opSize
            cPoint.y = outRect.y
            cPoint.type = 'x'
          } else {
            cPoint = null
          }
          break;
        case 'rx1-s':
          if (outRect) {
            cPoint.x = outRect.x1 + startRect.width * opSize
            cPoint.y = outRect.y
            cPoint.type = 'x'
          } else {
            cPoint = null
          }
          break;
        case 'rx-e':
          if (outRect) {
            cPoint.x = outRect.x + endRect.width * opSize
            cPoint.y = outRect.y
            cPoint.type = 'x'
          } else {
            cPoint = null
          }
          break;
        case 'rx1-e':
          if (outRect) {
            cPoint.x = outRect.x1 + endRect.width * opSize
            cPoint.y = outRect.y
            cPoint.type = 'x'
          } else {
            cPoint = null
          }
          break;
        case 'ry-s':
          if (outRect) {
            cPoint.y = outRect.y + startRect.height * opSize
            cPoint.x = outRect.x
            cPoint.type = 'y'
          } else {
            cPoint = null
          }
          break;
        case 'ry1-s':
          if (outRect) {
            cPoint.y = outRect.y1 + startRect.height * opSize
            cPoint.x = outRect.x
            cPoint.type = 'y'
          } else {
            cPoint = null
          }
          break;
        case 'ry-e':
          if (outRect) {
            cPoint.y = outRect.y + endRect.height * opSize
            cPoint.x = outRect.x
            cPoint.type = 'y'
          } else {
            cPoint = null
          }
          break;
        case 'ry1-e':
          if (outRect) {
            cPoint.y = outRect.y1 + endRect.height * opSize
            cPoint.x = outRect.x
            cPoint.type = 'y'
          } else {
            cPoint = null
          }
          break;
      }
      if (cPoint) {
        recommendPaths.push(cPoint)
      }
    });
  }
  return recommendPaths;
}

export default calAutoLinePath
export { calAutoLinePath, getRecommendPath }