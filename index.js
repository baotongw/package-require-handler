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

        return list;
    }
}

module.exports = handler;