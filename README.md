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

于是，我下定决心要做这么一款工具。还好，不是从头做。至少，后端[Rust Restful API](https://static.rust-lang.org/dist/2020-06-18/)是现成的，并且还支持`CORS`。这样事情就简单多了。
