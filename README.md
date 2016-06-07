# package-file-handler

## 简介
这是一个用来处理fekit工程中文件引用关系的插件，通过对外接口提供一个文件的export，方法会返回该文件所require进来的所有文件。
可以基于该插件做一些和文件引用相关的开发工作，目前只支持到基于commonJS的代码分析。
同时支持fekit_module和标准的node_module模块获取
目前支持js,css,string,mustache等后缀的文件。

使用时需要本地有对应的工程代码，目前适合内部team使用。如果需要其他扩展可联系我

## 使用方法
    npm install package-require-handler 或者 cnpm install package-require-handler
    
    var requireHandler = require('package-require-handler');
    
    requireHandler.setOptions(config, rootFolder);
    requireHandler.getFileRequireList(filePath);
    
## 使用说明
    #### rootFolder
        可以指定解析的文件目录，默认为当前命令执行的目录
    #### config应包括
        工程目录路径快捷方式
        alias:
        工程模块的安装路径
        modulesDirectories：['fekit_modules','node_modules']
        支持的文件后缀名
        extensions: ['.js', '.css', '.webpack.js', '.jsx', '.web.js', '.mustache', '.string']
    #### filaPath
        传入的filePath应该为team标准的文件输出
        'scripts/app/theme_trip/theme/hub.js'
        'styles/theme/page/theme/index.css'  
    #### 返回值
        类型：数组
        数组元素：对象，具体字段有
            filePath：文件绝对路径
            relativePath：文件相对路径
            key：根据文件绝对路径加密过的key
            isModule：是否引用的是一个module