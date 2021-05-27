import createTag from "./createTag"
// import icon from './icon.jpg'
import './main.css'
let ele = createTag('h1', '一级标题')
let img = createTag('img')
// img.src = icon
document.body.append(ele, img)