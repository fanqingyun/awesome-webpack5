export default (tag, text) => {
  let ele = document.createElement(tag)
  ele.innerHTML = text
  return ele

}