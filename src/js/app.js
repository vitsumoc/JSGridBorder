import backImg from '../3.png'

import {gridBorder} from './gridBorder.js'

// 加载底图
let canvas = document.getElementById("vCanvas");
let ctx = canvas.getContext("2d");

let img = new Image()
img.src = backImg
img.onload = function(){
  ctx.drawImage(img, 0, 0, 800, 600);
  canvas.onclick = function(e) {
    let border = gridBorder(canvas, e.offsetX, e.offsetY)

    // 绘制测试
    border.push(border[0])
    for (let x = 0; x < border.length - 1; x++) {
      ctx.moveTo(border[x][0], border[x][1])
      ctx.lineTo(border[x+1][0], border[x+1][1])
      ctx.stroke()
    }
  }
}
