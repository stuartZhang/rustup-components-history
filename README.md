# diagonal-demo7

> diagonal-demo7 的 管理界面前端。

## `Jenkins`打包说明

预置`Jenkins`构建`shell`脚本程序在工程根目录。其文件名被统一命名为`jenkins.build.sh`。所以，在`Jenkins`->【配置】->【构建】下的`shell`编辑器内，仅需录入如下指令即可：

```shell
#!/bin/bash -xe

chmod a+x ${WORKSPACE}/jenkins.build.sh

${WORKSPACE}/jenkins.build.sh
```
