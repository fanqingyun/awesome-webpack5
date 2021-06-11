# awesome-webpack5

学习 webpack5 过程的一些例子或者笔记

## webpack-dev-server 理解

### contentBase

webpack-dev-server 默认会将构建结果和输出文件全部作为开发服务器的资源文件，也就是说，只要通过 Webpack 打包能够输出的文件都可以直接被访问到。但是如果你还有一些**没有参与打包的静态文件**也需要作为开发服务器的资源被访问，那你就需要额外通过配置“告诉” webpack-dev-server。

具体的方法就是在 webpack-dev-server 的配置对象中添加一个对应的配置。我们回到配置文件中，找到 devServer 属性，它的类型是一个对象，我们可以通过这个 devServer 对象的 contentBase 属性指定额外的静态资源路径。这个 contentBase 属性可以是一个字符串或者数组，也就是说你可以配置一个或者多个路径。具体配置如下：

```js
// ./webpack.config.js
module.exports = {
  // ...
  devServer: {
    contentBase: 'public',
  },
}
```

我们这里将这个路径设置为项目中的 public 目录。可能有人会有疑问，之前我们在使用插件的时候已经将这个目录通过 copy-webpack-plugin 输出到了输出目录，按照刚刚的说法，所有输出的文件都可以直接被 serve，也就是能直接访问到，按道理应该不需要再作为开发服务器的静态资源路径了。

确实是这样的，而且如果你能想到这一点，也就证明你真正理解了 webpack-dev-server 的文件加载规则。

但是在实际使用 Webpack 时，我们一般都会把 copy-webpack-plugin 这种插件留在上线前的那一次打包中使用，而开发过程中一般不会用它。因为在开发过程中，我们会频繁重复执行打包任务，假设这个目录下需要拷贝的文件比较多，如果每次都需要执行这个插件，那打包过程开销就会比较大，每次构建的速度也就自然会降低。

至于如何实现某些插件只在生产模式打包时使用，是额外的话题，所以具体的操作方式会在 10 课时中详细介绍。这里我们先移除 CopyWebpackPlugin，确保这里的打包不会输出 public 目录中的静态资源文件，然后回到命令行再次执行 webpack-dev-server。

启动过后，我们打开浏览器，这里我们访问的页面文件和 bundle.js 文件均来自于打包结果。我们再尝试访问 favicon.ico，因为这个文件已经没有参与打包了，所以这个文件必然来源于 contentBase 中配置的目录了。

### 热模块替换

## 如何配置 Webpack SourceMap 的最佳实践

SourceMap: 映射转换后的代码与源代码之间的关系。一段转换后的代码，通过转换过程中生成的 Source Map 文件就可以逆向解析得到对应的源代码。webpack 中使用 devtool 来配置

### eval 模式

不会生成 map 文件，每个模块中的代码都被包裹到了一个 eval 函数中，而且每段模块代码的最后都会通过 sourceURL 的方式声明这个模块对应的源文件路径，
![image.png](https://upload-images.jianshu.io/upload_images/19589049-c1812b8fb38c55fb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
报错时，可以知道报错的代码在哪个文件，且控制台打开这个文件看到的却是打包后的模块代码，而并非我们真正的源代码。
综上，构建速度最快，但是缺点同样明显：它只能定位源代码的文件路径，无法知道具体的行列信息。

### source-map 模式

提供完整源代码， 错误信息能定位到具体的行列信息

### cheap 模式

错误信息只能定位到具体的行

### module 模式

不经过 loader 转换的代码，即源代码

### inline 模式

源代码以 dataURL 的形式存在
![image.png](https://upload-images.jianshu.io/upload_images/19589049-2e5dc245e54fc395.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

其实 devtool 的值就是上面几种模式的组合

## Webpack 中的模块热替换

指的是我们可以在应用运行过程中，实时的去替换掉应用中的某个模块，而应用的运行状态不会因此而改变。例如，我们在应用运行过程中修改了某个模块，通过自动刷新会导致整个应用的整体刷新，那页面中的状态信息都会丢失；而如果使用的是 HMR，就可以实现只将修改的模块实时替换至应用中，不必完全刷新整个应用。
使用这个特性最简单的方式就是，在运行 webpack-dev-server 命令时，通过 --hot 参数去开启这个特性。

或者也可以在配置文件中通过添加对应的配置来开启这个功能。那我们这里打开配置文件，这里需要配置两个地方：

首先需要将 devServer 对象中的 hot 属性设置为 true；
然后需要载入一个插件，这个插件是 webpack 内置的一个插件，所以我们先导入 webpack 模块，有了这个模块过后，这里使用的是一个叫作 HotModuleReplacementPlugin 的插件。
具体配置代码如下：

```js
// ./webpack.config.js
const webpack = require('webpack')

module.exports = {
  // ...
  devServer: {
    // 开启 HMR 特性，如果资源不支持 HMR 会 fallback 到 live reloading
    hot: true,
    // 只使用 HMR，不会 fallback 到 live reloading
    // hotOnly: true
  },
  plugins: [
    // ...
    // HMR 特性所需要的插件
    new webpack.HotModuleReplacementPlugin(), // 后续新版本的 Webpack，开启 hot 选项，这个插件会自动引入
  ],
}
```

以上代码可以让 css 实现热更新，但 js 的热更新需要手动处理，例如

```js
module.hot.accept('./editor', () => {
  // 当 ./editor.js 更新，自动执行此函数
  console.log('editor 更新了～～')
})
```

对于开启 HMR 特性的环境中，我们可以访问到全局的 module 对象中的 hot 成员，这个成员是一个对象，这个对象就是 HMR API 的核心对象，它提供了一个 accept 方法，用于注册当某个模块更新后的处理函数。accept 方法第一个参数接收的就是所监视的依赖模块路径，第二个参数就是依赖模块更新后的**处理函数**，因为对于不同 js 模块，这个**处理函数**的逻辑可能不同，所以才需要手动去更新。

那也就是说一旦这个模块的更新被我们手动处理了，就不会触发自动刷新；反之，如果没有手动处理，热替换会自动 fallback（回退）到自动刷新。

Q1：可能你会问，为什么我们开启 HMR 过后，样式文件的修改就可以直接热更新呢？我们好像也没有手动处理样式模块的更新啊？

A1：这是因为样式文件是经过 Loader 处理的，在 style-loader 中就已经自动处理了样式文件的热更新，所以就不需要我们额外手动去处理了。

Q2：那你可能会想，凭什么样式就可以自动处理，而我们的脚本就需要自己手动处理呢？

A2：这个原因也很简单，因为样式模块更新过后，只需要把更新后的 CSS 及时替换到页面中，它就可以覆盖掉之前的样式，从而实现更新。

而我们所编写的 JavaScript 模块是没有任何规律的，你可能导出的是一个对象，也可能导出的是一个字符串，还可能导出的是一个函数，使用时也各不相同。所以 Webpack 面对这些毫无规律的 JS 模块，根本不知道该怎么处理更新后的模块，也就无法直接实现一个可以通用所有情况的模块替换方案。

那这就是为什么样式文件可以直接热更新，而 JS 文件更新后页面还是回退到自动刷新的原因。

Q3：那可能还有一些平时使用 vue-cli 或者 create-react-app 这种框架脚手架工具的人会说，“我的项目就没有手动处理，JavaScript 代码照样可以热替换，也没你说的那么麻烦”。

A3：这是因为你使用的是框架，使用框架开发时，我们项目中的每个文件就有了规律，例如 React 中要求每个模块导出的必须是一个函数或者类，那这样就可以有**通用的替换办法**，所以这些工具内部都已经帮你实现了通用的替换操作，自然就不需要手动处理了。

热更新失败就会退后到自动更新，可以通过设置 devServer 的 hotOnly 属性来阻止这一行为

打包后，编写的处理热替换的代码都被移除掉了，只剩下一个 if (false) 的空判断，这种没有意义的判断，在压缩过后也会自动去掉，所以根本不会对生产环境有任何影响

## Tree Shaking

去除冗余代码，所谓冗余代码，就是没有被引用或者使用的代码。

需要注意的是，Tree-shaking 并不是指 Webpack 中的某一个配置选项，而是一组功能搭配使用过后实现的效果，这组功能在生产模式下都会自动启用，所以使用生产模式打包就会有 Tree-shaking 的效果。

Tree-shaking 的实现，整个过程用到了 Webpack 的两个优化功能：

- usedExports - 打包结果中只导出外部用到的成员；未被引用的会被标记
- minimize - 压缩打包结果，把被标记的未被引用的删除。

如果把我们的代码看成一棵大树，那你可以这样理解：

- usedExports 的作用就是标记树上哪些是枯树枝、枯树叶；
- minimize 的作用就是负责把枯树枝、枯树叶摇下来。

```js
// ./webpack.config.js
module.exports = {
  // ... 其他配置项
  optimization: {
    // 模块只导出被使用的成员
    usedExports: true,
    // 压缩输出结果
    minimize: true,
  },
}
```

### 合并模块

普通打包只是将一个模块最终放入一个单独的函数中，如果我们的模块很多，就意味着在输出结果中会有很多的模块函数。
concatenateModules 配置的作用就是尽可能将所有模块合并到一起输出到一个函数中，这样既提升了运行效率，又减少了代码的体积。

```js
// ./webpack.config.js
module.exports = {
  // ... 其他配置项
  optimization: {
    // 模块只导出被使用的成员
    usedExports: true,
    // 尽可能合并每一个模块到一个函数中
    concatenateModules: true,
    // 压缩输出结果
    minimize: false,
  },
}
```

这个特性又被称为 Scope Hoisting，也就是作用域提升，它是 Webpack 3.0 中添加的一个特性。

如果再配合 minimize 选项，打包结果的体积又会减小很多。

### 结合 babel-loader 的问题

因为早期的 Webpack 发展非常快，那变化也就比较多，所以当我们去找资料时，得到的结果不一定适用于当前我们所使用的版本。而 Tree-shaking 的资料更是如此，很多资料中都表示“为 JS 模块配置 babel-loader，会导致 Tree-shaking 失效”。

针对这个问题，这里我统一说明一下：

首先你需要明确一点：Tree-shaking 实现的前提是 ES Modules，也就是说：最终交给 Webpack 打包的代码，必须是使用 ES Modules 的方式来组织的模块化。

为什么这么说呢？

我们都知道 Webpack 在打包所有的模块代码之前，先是将模块根据配置交给不同的 Loader 处理，最后再将 Loader 处理的结果打包到一起。

很多时候，我们为了更好的兼容性，会选择使用 babel-loader 去转换我们源代码中的一些 ECMAScript 的新特性。而 Babel 在转换 JS 代码时，很有可能处理掉我们代码中的 ES Modules 部分，把它们转换成 CommonJS 的方式，如下图所示：

![source->babel-loader->bundle](https://s0.lgstatic.com/i/image/M00/0C/1E/Ciqc1F7CKjiAeXTAAABAsbetEV0413.png)

当然了，Babel 具体会不会处理 ES Modules 代码，取决于我们有没有为它配置使用转换 ES Modules 的插件。

很多时候，我们为 Babel 配置的都是一个 preset（预设插件集合），而不是某些具体的插件。例如，目前市面上使用最多的 @babel/preset-env，这个预设里面就有转换 ES Modules 的插件。所以当我们使用这个预设时，代码中的 ES Modules 部分就会被转换成 CommonJS 方式。那 Webpack 再去打包时，拿到的就是以 CommonJS 方式组织的代码了，所以 Tree-shaking 不能生效。

但是，最新版本的 babel-loader 并不会导致 Tree-shaking 失效。如果你不确定现在使用的 babel-loader 会不会导致这个问题，最简单的办法就是在配置中将 @babel/preset-env 的 modules 属性设置为 false，确保不会转换 ES Modules，也就确保了 Tree-shaking 的前提。

## sideEffects

Webpack 4 中新增了一个 sideEffects 特性，它允许我们通过配置标识我们的代码是否有副作用，从而提供更大的压缩空间。

> TIPS：模块的副作用指的就是模块执行的时候除了导出成员，是否还做了其他的事情。

这个特性一般只有我们去开发一个 npm 模块时才会用到。因为官网把对 sideEffects 特性的介绍跟 Tree-shaking 混到了一起，所以很多人误认为它们之间是因果关系，其实它们没有什么太大的关系。

Tree-shaking 只能移除没有用到的代码成员，而想要完整移除没有用到的模块，那就需要开启 sideEffects 特性了。

```js
// ./webpack.config.js
module.exports = {
  mode: 'none',
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
  },
  optimization: {
    sideEffects: true,
  },
}
```

那此时 Webpack 在打包某个模块之前，会先检查这个模块所属的 package.json 中的 sideEffects 标识，以此来判断这个模块是否有副作用，如果没有副作用的话，这些没用到的模块就不再被打包。换句话说，即便这些没有用到的模块中存在一些副作用代码，我们也可以通过 package.json 中的 sideEffects 去强制声明没有副作用。

那我们打开项目 package.json 添加一个 sideEffects 字段，把它设置为 false，具体代码如下：

```js
{
  "name": "09-side-effects",
  "version": "0.1.0",
  "author": "zce <w@zce.me> (https://zce.me)",
  "license": "MIT",
  "scripts": {
    "build": "webpack"
  },
  "devDependencies": {
    "webpack": "^4.43.0",
    "webpack-cli": "^3.3.11"
  },
  "sideEffects": false
}
```

这里设置了两个地方：

- webpack.config.js 中的 sideEffects 用来开启这个功能；
- package.json 中的 sideEffects 用来标识我们的代码没有副作用。

目前很多第三方的库或者框架都已经使用了 sideEffects 标识，所以我们再也不用担心为了一个小功能引入一个很大体积的库了。例如，某个 UI 组件库中只有一两个组件会用到，那只要它支持 sideEffects，你就可以放心大胆的直接用了。

基于原型的扩展方式，在很多 Polyfill 库中都会大量出现，比较常见的有 es6-promise，这种模块都属于典型的副作用模块。

除此之外，我们在 JS 中直接载入的 CSS 模块，也都属于副作用模块。

所以说不是所有的副作用都应该被移除，有一些必要的副作用需要保留下来。

最好的办法就是在 package.json 中的 sideEffects 字段中标识需要保留副作用的模块路径（可以使用通配符），具体配置如下：

```js
{

  "name": "09-side-effects",

  "version": "0.1.0",

  "author": "zce <w@zce.me> (https://zce.me)",

  "license": "MIT",

  "scripts": {

    "build": "webpack"

  },

  "devDependencies": {

    "webpack": "^4.43.0",

    "webpack-cli": "^3.3.11"

  },

  "sideEffects": [

    "./src/extend.js",

    "*.css"

  ]

}

```

总结下来其实也很简单：对全局有影响的副作用代码不能移除，而只是对模块有影响的副作用代码就可以移除。

## Code Splitting（分块打包）

All in One 的方式并不合理，更为合理的方案是把打包的结果按照一定的规则分离到多个 bundle 中，然后根据应用的运行需要按需加载。这样就可以降低启动成本，提高响应速度。

Webpack 实现分包的方式主要有两种：

- 根据业务不同配置多个打包入口，输出多个打包结果；
- 结合 ES Modules 的动态导入（Dynamic Imports）特性，按需加载模块。

### 对入口打包

```js
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  entry: {
    index: './src/index.js',
    album: './src/album.js',
  },
  output: {
    filename: '[name].bundle.js', // [name] 是入口名称
  },
  // ... 其他配置
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Multi Entry',
      template: './src/index.html',
      filename: 'index.html',
      chunks: ['index'], // 指定使用 index.bundle.js
    }),
    new HtmlWebpackPlugin({
      title: 'Multi Entry',
      template: './src/album.html',
      filename: 'album.html',
      chunks: ['album'], // 指定使用 album.bundle.js
    }),
  ],
}
```

### 提取公共模块

```js
optimization: {
  splitChunks: {
    // 自动提取所有公共模块到单独 bundle
    chunks: 'all'
  }
}
```

### 动态导入

## 其他

对于 node_modules/.bin 目录下的 CLI，我们可以使用 npx 命令或者 yarn 命令直接启动。

Webpack 中划分了 Loader、Plugin 和 Minimizer 三种扩展方式
