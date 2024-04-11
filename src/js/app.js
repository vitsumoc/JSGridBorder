import backImg from '../1.png'

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
    ctx.strokeStyle = "#999999"
    ctx.beginPath()
    border.push(border[0])
    for (let x = 0; x < border.length; x++) {
      ctx.lineTo(border[x][0], border[x][1])
    }
    ctx.stroke()
  }
}
