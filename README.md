# awesome-webpack5

学习 webpack5 过程的一些例子或者笔记

## webpack-dev-server 理解

### contentBase

webpack-dev-server 默认会将构建结果和输出文件全部作为开发服务器的资源文件，也就是说，只要通过 Webpack 打包能够输出的文件都可以直接被访问到。但是如果你还有一些**没有参与打包的静态文件**也需要作为开发服务器的资源被访问，那你就需要额外通过配置“告诉” webpack-dev-server。

具体的方法就是在 webpack-dev-server 的配置对象中添加一个对应的配置。我们回到配置文件中，找到 devServer 属性，它的类型是一个对象，我们可以通过这个 devServer 对象的 contentBase 属性指定额外的静态资源路径。这个 contentBase 属性可以是一个字符串或者数组，也就是说你可以配置一个或者多个路径。具体配置如下：

复制代码
// ./webpack.config.js
module.exports = {
// ...
devServer: {
contentBase: 'public'
}
}
我们这里将这个路径设置为项目中的 public 目录。可能有人会有疑问，之前我们在使用插件的时候已经将这个目录通过 copy-webpack-plugin 输出到了输出目录，按照刚刚的说法，所有输出的文件都可以直接被 serve，也就是能直接访问到，按道理应该不需要再作为开发服务器的静态资源路径了。

确实是这样的，而且如果你能想到这一点，也就证明你真正理解了 webpack-dev-server 的文件加载规则。

但是在实际使用 Webpack 时，我们一般都会把 copy-webpack-plugin 这种插件留在上线前的那一次打包中使用，而开发过程中一般不会用它。因为在开发过程中，我们会频繁重复执行打包任务，假设这个目录下需要拷贝的文件比较多，如果每次都需要执行这个插件，那打包过程开销就会比较大，每次构建的速度也就自然会降低。

至于如何实现某些插件只在生产模式打包时使用，是额外的话题，所以具体的操作方式会在 10 课时中详细介绍。这里我们先移除 CopyWebpackPlugin，确保这里的打包不会输出 public 目录中的静态资源文件，然后回到命令行再次执行 webpack-dev-server。

启动过后，我们打开浏览器，这里我们访问的页面文件和 bundle.js 文件均来自于打包结果。我们再尝试访问 favicon.ico，因为这个文件已经没有参与打包了，所以这个文件必然来源于 contentBase 中配置的目录了。

### 热模块替换

## 7. 如何配置 Webpack SourceMap 的最佳实践

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

Q1：可能你会问，为什么我们开启 HMR 过后，样式文件的修改就可以直接热更新呢？我们好像也没有手动处理样式模块的更新啊？

A1：这是因为样式文件是经过 Loader 处理的，在 style-loader 中就已经自动处理了样式文件的热更新，所以就不需要我们额外手动去处理了。

Q2：那你可能会想，凭什么样式就可以自动处理，而我们的脚本就需要自己手动处理呢？

A2：这个原因也很简单，因为样式模块更新过后，只需要把更新后的 CSS 及时替换到页面中，它就可以覆盖掉之前的样式，从而实现更新。

而我们所编写的 JavaScript 模块是没有任何规律的，你可能导出的是一个对象，也可能导出的是一个字符串，还可能导出的是一个函数，使用时也各不相同。所以 Webpack 面对这些毫无规律的 JS 模块，根本不知道该怎么处理更新后的模块，也就无法直接实现一个可以通用所有情况的模块替换方案。

那这就是为什么样式文件可以直接热更新，而 JS 文件更新后页面还是回退到自动刷新的原因。

Q3：那可能还有一些平时使用 vue-cli 或者 create-react-app 这种框架脚手架工具的人会说，“我的项目就没有手动处理，JavaScript 代码照样可以热替换，也没你说的那么麻烦”。

A3：这是因为你使用的是框架，使用框架开发时，我们项目中的每个文件就有了规律，例如 React 中要求每个模块导出的必须是一个函数或者类，那这样就可以有通用的替换办法，所以这些工具内部都已经帮你实现了通用的替换操作，自然就不需要手动处理了。
