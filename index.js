var RequireHandler = require('./handler/requireHandler.js'),
    configHandler = require('./handler/configHandler.js');

var handler = {
    setOptions: function (config, rootFolder) {
        this.config = configHandler.initConfig(config);
        this.rootFolder = rootFolder || process.cwd();
        
        this.requireHandler = new RequireHandler(rootFolder, this.config);
    },
    getFileRequireList: function (filePath) {
        if(!this.config) {
            throw new Error('未指定组件config，参考组件说明');
        }
        
        var list;
        
        try{
            list = this.requireHandler.getRequireList(filePath);
        } catch(err) {
            console.log('传入的文件地址解析失败：' + filePath);
            console.log('error message: ' + err.message);
        }
        console.log(list)
        return list;
    }
}

var root = 'D:\\Tools\\qzz\\webpack-tools';
var config = {
    alias: {
        "lib": "src/scripts/lib",
        "base": "src/scripts/lib/common",
        "plugins": "src/scripts/lib/ui",
        "page": "src/scripts/page/",
        "app": "src/scripts/app/",
        "easyui": "src/scripts/lib/ui/easyui/components",
        "easycss": "src/styles/zhuanti/easyui",
        "basecss": "src/styles/base",
        "pluginscss": "src/styles/ui",
        "themecss": "src/styles/theme",
        "commoncss": "src/styles/common",
        "styleRoot": "src/styles/",
        "scriptRoot": "src/scripts/",
        "QChat": "fekit_modules/qchat/src",
        "outbroundcss": "src/styles/outbround"
    },
    modulesDirectories: ['node_modules', 'fekit_modules'],
    extensions: ['', '.js', '.webpack.js', '.jsx', '.css', '.web.js', '.mustache', '.string']
}

var testPath = 'scripts/app/theme_trip/theme/hub.js';
//testPath = 'styles/theme/page/theme/index.css';

handler.setOptions(config, root);
handler.getFileRequireList(testPath);

module.exports = handler;