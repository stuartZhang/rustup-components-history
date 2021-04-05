# rustup-components-history

这款网页工具是`Mozilla`官方[Rustup components availability tool](https://github.com/rust-lang/rustup-components-history#rustup-components-availability-tool)在线工具的强化版。

官方在线工具仅能提供最近七天`Nightly Artifact`的组件可用性报告。但是，我做的强化版则能够根据

1. 发布频道`channel`
2. （交叉）编译的目标平台`target`
3. 发布时间（范围）

生成`Nightly Artifact`的组件可用性报告。甚至，它还能

1. 用绿色高亮出`profile = complete`的`Nightly Artifact`
2. 用黄色高亮出`profile = default`的`Nightly Artifact`
3. 用红色高亮出不可用的`Nightly Artifact`
4. 列出每一个组件的最后发布日期

![Rustup components availability tool](https://user-images.githubusercontent.com/13935927/113554926-a40d6200-962c-11eb-9e16-4a7454d512ad.png)

此外，搜索表单项

1. 【发布频道】是一个组合输入框。既可以选择枚举值，也允许输入具体的版本号`<major.minor>|<major.minor.patch>`
2. 【目标平台】支持模糊匹配的搜索功能，因为平台项太多了。

## 我为什么要强化[Rustup components availability tool](https://github.com/rust-lang/rustup-components-history#rustup-components-availability-tool)在线工具

`2021`年清明节放假期间，我鬼使神差地执行了`rustup update`指令将本地安装的`nightly rustup toolchain`做了一次大升级。多么错误的决定！关键是我没有记录升级前能够正常工作的`nightly rustup toolchain`的版本信息（特别是，发布日期）。

在工具链被升级之后，我悲哀地发现`wasm-pask`开始编译失败了。其一直在报`error: linking with rust-lld failed`的链接错误。后来，我`Google`得知这是：“新版本`nightly - rustc`编译器与`wasm-pack`之间兼容性的、已知的缺陷。得等`wasm-pack`后续版本升级”。

等`wasm-pack`升级，得等到什么时候，谁知道呀！我眼下必须立即回退`nightly - rustup toolchain`到正常版本，让我的工程尽快恢复工作状态。因为升级前我没有查看与记录旧`nightly - rustup toolchain`的版本号与发布日期，所以我想退版本，却不知道要退到哪个版本？

官方[Rustup components availability tool](https://github.com/rust-lang/rustup-components-history#rustup-components-availability-tool)在线工具罗列的`nightly - rustup toolchain`，我都试了个遍也没有避开`error: linking with rust-lld failed`错误。所以，我需要回退到更早得多的版本。即，官方[Rustup components availability tool](https://github.com/rust-lang/rustup-components-history#rustup-components-availability-tool)在线工具并**没能**提供**组件完整性报告**的版本。没有【组件完整性报告】而一个版本一个版本地试，那得是多么缓慢与痛苦的过程呀！

于是，我下定决心要做这么一款工具。还好，不是从头做。至少，后端[Rust Restful API](https://static.rust-lang.org/dist/2020-06-18/)是现成的，并且还支持`CORS`。这样前端的事情就简单多了。

## 工作原因

1. 首先，根据【发布日期】区间搜索条件，逐天地调用`https://static.rust-lang.org/?prefix=***&marker=***`接口，从而获得每一天的`nightly rustup toolchain`的发布版本信息。
2. 然后，对后端返回的数据，根据【发布频道】与【目标平台】做过滤。
3. 接着，再重新组织数据为
   1. 以组织为行
   2. 以日期为列
   的二维数据结构。

大约就这么简单吧。其两、三个小时左右的工作量。`webpack4 + babel7 + ts4 + scss + vue3`真香！

## 如何使用这款工具

我没有条件把这个静态网页部署到某个公网服务器上。但是，你可以把整个工程`git clone`到你本地。然后，本地运行。

### 系统要求

1. 要求`node`版本大于等于`10.x`，同时小于等`12.x`。
2. 安装命令行工具[@minxing/cli](http://npm.dehuinet.com:8100/-/web/detail/@minxing/cli)

   ```shell
   npm i -g @minxing/cli@latest --registry=http://npm.dehuinet.com:8100
   ```

   因为工程里的许多依赖都来自于公司的`npm`私有云。

### 方案一步骤

1. 去到工程根目录
2. 执行`minxing i`安装依赖
3. 执行`npm run dev`。然后，你本地的默认浏览器就会自动打开网址`http://127.0.0.1:9000/web_apps/rustup-components-history/`

### 方案二步骤

1. 去到工程根目录
2. 执行`minxing i`安装依赖
3. 执行`npm run build`。
4. 将`dist`文件夹下的内容，`scp`上传到你们的内网`web server`目录内。
5. 或在`dist`目录下，执行`http-server`，便可直接打开网页了。
