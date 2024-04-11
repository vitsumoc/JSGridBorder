
// 因为 x y 表示坐标, 这个程序里的循环数都使用 i j k
// 私有全局变量
let _c = null
let _ctx = null
let _baseColor = null
let _minX = 0
let _minY = 0
let _maxX = null
let _maxY = null
// 点状态枚举
let STATE_INIT = 0 // 在本轮被初始化, 无需参与本轮计算
let STATE_READY = 1 // 在上一轮被初始化, 可以被计算
let STATE_INNER = 2 // 已经参与过计算, 属于内部的点
let STATE_BORDER = 3 // 已经参与过计算, 属于边界点
let STATE_CHECKET = 4 // 已经被检查过, 纳入borderList
// 计算结构 [x]<=>[y]<=>{color, state}
let map = {}

// 功能入口, 通过点获得边框
function gridBorder(canvas, x, y) {
  // 全局变量赋值
  _c = canvas
  _ctx = _c.getContext("2d")
  _baseColor = _color(x, y)
  _maxX = Number(_c.offsetWidth)
  _maxY = Number(_c.offsetHeight)
  x = Number(x)
  y = Number(y)
  // 清理
  map = {}

  // 提供初始值
  map[x] = {}
  map[x][y] = {
    color: _baseColor,
    state: STATE_INIT
  }
  // 计算边界
  while (run()) {}

  // 测试边界点
  // _checkMap()

  // 将计算好的map做成一个点的数组
  let borders = borderList()

  // 检测边界
  // _checkBorders(borders)


  // 得益于之前 border 点不在扩张的设置, 现在的 borders 可以被绘制成一组短线
  // 由于前面的 borders 是连接有序的, 只需要再迭代一次, 将这些点变成线的端点就可以了
  let linePoints = borderToLine(borders)

  // 返回边界
  return linePoints
}

// 计算方法, 返回 true 表示仍需迭代
function run() {
  // 把 INIT 变为 READY, 如果没有则返回 false
  let readyList = []
  let xs = Object.keys(map)
  for (let i = 0; i < xs.length; i++) {
    let x = Number(xs[i])
    let ys = Object.keys(map[x])
    for (let j = 0; j < ys.length; j++) {
      let y = Number(ys[j])
      if (map[x][y].state == STATE_INIT) {
        map[x][y].state = STATE_READY
        readyList.push([x, y])
      }
    }
  }
  if (readyList.length == 0) {
    return false
  }
  // 把 READY 变为 INNER 或 BORDER, 同时扩展新的 INIT
  for (let i = 0; i < readyList.length; i++) {
    let x = Number(readyList[i][0])
    let y = Number(readyList[i][1])
    let point = map[x][y]
    // 判断自身的状态
    // if (_colorEqual(point.color, _baseColor)) {
    if (point.color == _baseColor) { // 同色属于内部
      point.state = STATE_INNER
    } else { // 异色属于边界
      point.state = STATE_BORDER
    }
    // 同色情况下, 扩展探索范围 上/下/左/右
    if (point.state == STATE_INNER) {
      _pointOrNull(x - 1, y)
      _pointOrNull(x + 1, y)
      _pointOrNull(x, y - 1)
      _pointOrNull(x, y + 1)
    }
  }
  return true
}

// 将计算好的map做成一个点的数组
// 从第一个border点作为起点, 按照上下左右的顺序寻找下一个与其连接的border点, 循环直到回到原点, 如此得到一个闭环的border
function borderList() {
  // 获得原点
  let originPoint = null
  let xs = Object.keys(map)
  for (let i = 0; i < xs.length; i++) {
    let x = Number(xs[i])
    let ys = Object.keys(map[x])
    for (let j = 0; j < ys.length; j++) {
      let y = Number(ys[j])
      let p = map[x][y]
      if (p.state == STATE_BORDER) {
        p.state = STATE_CHECKET
        originPoint = [x, y]
        break
      }
    }
    if (originPoint) {
      break
    }
  }
  // 存储border链的数组
  let borders = [originPoint]
  // 被迭代的邻居节点
  let neighbor = [originPoint[0], originPoint[1]]
  // 无限寻找邻居, 直到回到原点
  while (true) {
    let getNeighbor = false
    // 寻找八方点, 获得新邻居
    if (!getNeighbor) {
      getNeighbor = _findNeighbor(neighbor, -1, -1, borders)
    }
    if (!getNeighbor) {
      getNeighbor = _findNeighbor(neighbor, -1, 0, borders)
    }
    if (!getNeighbor) {
      getNeighbor = _findNeighbor(neighbor, -1, 1, borders)
    }
    if (!getNeighbor) {
      getNeighbor = _findNeighbor(neighbor, 0, -1, borders)
    }
    if (!getNeighbor) {
      getNeighbor = _findNeighbor(neighbor, 0, 1, borders)
    }
    if (!getNeighbor) {
      getNeighbor = _findNeighbor(neighbor, 1, -1, borders)
    }
    if (!getNeighbor) {
      getNeighbor = _findNeighbor(neighbor, 1, 0, borders)
    }
    if (!getNeighbor) {
      getNeighbor = _findNeighbor(neighbor, 1, 1, borders)
    }
    if (!getNeighbor) {
      break
    }
    if (neighbor[0] == originPoint[0] && neighbor[1] == originPoint[1]) {
      break
    }
  }
  return borders
}

function borderToLine(borders) {
  let linePoints = []
  let currentP = borders[0]
  linePoints.push([currentP[0], currentP[1]])
  for (let x = 1; x < borders.length; x++) {
    // 非相邻情况, 认为发生了中断
    if (currentP[0] != borders[x][0] && currentP[1] != borders[x][1]) {
      linePoints.push([borders[x][0], borders[x][1]])
      // 下次
      currentP = borders[x]
      continue
    }
    // 本点和下下个点处于对角, 也认为中断
    if (x + 1 < borders.length) {
      if (Math.abs(currentP[0] - borders[x + 1][0]) == 1 && Math.abs(currentP[1] - borders[x + 1][1]) == 1) {
        linePoints.push([borders[x][0], borders[x][1]])
        // 下次
        currentP = borders[x]
        continue
      }
    }
    // 直线, 继续
    currentP = borders[x]
  }
  return linePoints
}

// 工具方法, 根据xy的偏移量寻找邻居, 并完成重复操作
function _findNeighbor(neighbor, xOffset, yOffset, borders) {
  let p = _pointOrNull(neighbor[0] + xOffset, neighbor[1] + yOffset)
  if (p && p.state == STATE_BORDER) {
    p.state = STATE_CHECKET
    neighbor[0] = neighbor[0] + xOffset
    neighbor[1] = neighbor[1] + yOffset
    borders.push([neighbor[0], neighbor[1]])
    return true
  }
  return false
}

// 工具方法, 获得指定坐标的点或者null
function _pointOrNull(x, y) {
  if (x < _minX || x > _maxX || y < _minY || y > _maxY) {
    return null
  }
  // 不存在则创建
  if (map[x] == undefined) {
    map[x] = {}
  }
  if (map[x][y] == undefined) {
    map[x][y] = {
      color: _color(x, y),
      state: STATE_INIT
    }
  }
  // 存在
  return map[x][y]
}

// 工具方法, 获得某点的颜色, 使用单一整数表示
function _color(x, y) {
  let p = _ctx.getImageData(x, y, 1, 1).data
  return p[0] * Math.pow(256, 3) + p[1] * Math.pow(256, 2) + p[2] * 256 + p[3]
}

// 工具方法，稍微有点容忍度的判断颜色是否相等(三色差绝对值之和小于某值视为相等)
// function _colorEqual(c1, c2) {
//   let d1 = c1 % 256 - c2 % 256
//   let d2 = (c1 % (256 * 256)) / 256 - (c2 % (256 * 256)) / 256
//   let d3 = (c1 % (256 * 256 * 256)) / (256 * 256) - (c2 % (256 * 256 * 256)) / (256 * 256)
//   let d4 = c1 / (256 * 256 * 256) - c2 / (256 * 256 * 256)
//   let deff = Math.abs(d1) + Math.abs(d2) + Math.abs(d3) + Math.abs(d4)
//   if (deff != 0) {
//     console.log(c1, c2, d1, d2, d3, d4)
//     console.log(deff)
//   }
//   if (deff < 500) {
//     return true
//   }
//   return false
// }

function _checkMap() {
  _ctx.save()
  _ctx.fillStyle = "#FF4400"

  let Xs = Object.keys(map)
  for (let i = 0; i < Xs.length; i++) {
    let x = Xs[i]
    let Ys = Object.keys(map[x])
    for (let j = 0; j < Ys.length; j++) {
      let y = Ys[j]
      let p = map[x][y]
      if (p.state == STATE_BORDER) {
        _ctx.fillRect(x, y, 1, 1)
      }
    }
  }

  _ctx.restore()
}

function _checkBorders(borders) {
  _ctx.save()
  _ctx.fillStyle = "#4400FF"

  borders.forEach(p => {
    _ctx.fillRect(p[0], p[1], 1, 1)
  })

  _ctx.restore()
}

export {gridBorder}