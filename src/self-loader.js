module.exports = function (source)  {
  console.log(source)
  console.log(this.query)
  // 最后的结果一定是一段js代码
  // return `export default function (){let style = document.createElement('style');style.innerHTML = ${JSON.stringify(source)}; document.head.append(style)}`
  return `let style = document.createElement('style');style.innerHTML = ${JSON.stringify(source)}; document.head.append(style)`
}
