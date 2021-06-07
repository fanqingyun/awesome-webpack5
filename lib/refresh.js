const fs = require('fs')
const hbs = require('handlebars')
const chalk = require('chalk')

module.exports = async () => {
  // 获取列表
  const list = fs.readdirSync('./src/views')
    .filter(v => v !== 'Home.vue')
    .map(v => ({
      name: v.replace('.vue', '').toLowerCase(),
      file: v
    }))

  // 生成路由文件
  compile({list}, './src/router.js', './template/router.js.hbs')

  // 生成菜单
  compile({list}, './src/App.vue', './template/App.vue.hbs')

  //meta:数据定义  filePath:目标文件 templatePath:模板文件
  function compile(meta, filePath, templatePath) {
    if (fs.existsSync(templatePath)) {
      const content = fs.readFileSync(templatePath).toString()
      const result = hbs.compile(content)(meta)
      fs.writeFileSync(filePath, result)
      console.log('创建成功');
    }
  }
}