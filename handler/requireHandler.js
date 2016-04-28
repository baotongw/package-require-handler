require('../utils/extensions.js');

var filesys = require('fs'),
    pathsys = require('path'),
    md5 = require('md5'),
    ModuleHandler = require('./moduleHandler.js');

function RequireHandler(rootFolder, config) {
    this.rootFolder = rootFolder;
    this.config = config;
    this.moduleHandler = new ModuleHandler(rootFolder, this.config);    
    
    this.pathTmpl = pathsys.join(rootFolder, 'src', '{0}');
    
    this.patterns = {
        // 匹配完整的一样require
        requireRowPattern: /.*?require\(\s*?['|"].*?['|"]\s*?\)/g,
        // 替换掉<require('filepath');>这一部分
        requireReplacePattern: /(require\(\s*?['|"].*?['|"]\s*?\))/igm,
        // 查找文件中是否存在require 
        requirePattern: /(?:require|@import\surl)\(['|"](.*?)['|"]\);*/igm, // /require\(\s*?['|"].*?['|"]\s*?\)/igm,
        // 匹配具体的引用路径
        pathPattern: /require\(\s*?['|"](.*?)['|"]\s*?\)/ig,
        // 匹配第一个单词，然后和alias配置匹配，如果有就替换为alias对应的完整路径
        aliasPattern: /(.+?)(?:\/|\\)/,
        // 匹配当前是否是一个单词，如果是则认为是一个module，亦或者是fekit支持的本地文件的一种
        // 后缀可能是css、js、string、mustache等
        modulePattern: /^[\w-_]+$/,
        commentPattern: /[\/\/.+/|\/\*[.|\s]+\*\/\/]/m
    }
}

RequireHandler.prototype.readFile = function (filePath) {
    var result,
        activePath;

    if (Array.isArray(filePath)) {
        for (var i = 0; i < filePath.length; i++) {
            result = filesys.readFileSync(filePath[i], 'utf-8');

            if (result) {
                activePath = filePath[i];
                break;
            }
        }
    } else {
        activePath = filePath;
        result = filesys.readFileSync(filePath, 'utf-8');
    }

    return {
        path: activePath,
        content: result
    }
}

//检测前缀是否包含alias，如果包含则替换成完整路径
RequireHandler.prototype.checkPrefix = function (filePath, parentPath) {
    var targetPath;

    // check alias and other pattern
    var matches = filePath.match(this.patterns.aliasPattern),
        prefix = parentPath ? this.rootFolder : '',
        aliasList = this.config.alias || {},
        alias;

    if (matches && matches.length === 2) {
        alias = matches[1];
    }

    // 匹配到了alias的存在，替换成完整路径
    if (aliasList[alias]) {
        targetPath = filePath.replace(this.patterns.aliasPattern, aliasList[alias] + '/');
        targetPath = pathsys.join(this.rootFolder, targetPath);
    } else {
        //相对于父文件的相对路径
        if(parentPath) {
            targetPath = pathsys.join(parentPath, filePath);    
        } else {
            targetPath = this.pathTmpl.format(filePath);   
        }
    }

    return targetPath;
}

// 如果文件地址中没有后缀名，则尝试和系统支持的后缀名逐个匹配，直到找到第一个匹配的为止
RequireHandler.prototype.checkExtensionName = function (filePath) {
    var types = this.config.extensions || [],
        fileExist,
        possiblePath,
        i;

    if (pathsys.extname(filePath) === '') {
        for (i = 0; i < types.length; i++) {
            possiblePath = filePath + types[i];

            if (filesys.existsSync(possiblePath)) {
                return possiblePath;
            }
        }
    }

    return filePath;
}

RequireHandler.prototype.checkModuleOrLocalFile = function (filePath, parentPath) {
    var targetPath;

    // 先检查是否是本地文件的相对路径引用
    targetPath = pathsys.join(parentPath || '', filePath);
    if (filesys.existsSync(targetPath)) {
        return {
            isModule: false,
            targetPath: targetPath
        }
    }

    targetPath = this.moduleHandler.getIndexPath(filePath);

    return {
        isModule: true,
        targetPath: targetPath
    }
}

RequireHandler.prototype.getRequireList = function (filePath, parentPath, requireList) {
    var isModule = false,
        moduleContent,
        requireList = requireList || [];
        
    if(!parentPath) {
        this.handled = {};
    }

    if (this.patterns.modulePattern.test(filePath)) {
        moduleContent = this.checkModuleOrLocalFile(filePath, parentPath);
        filePath = moduleContent.targetPath;
        isModule = moduleContent.isModule;
    } else {
        filePath = this.checkPrefix(filePath, parentPath);
        filePath = this.checkExtensionName(filePath);
    }

    var encyptPath = md5(filePath);

    var fileContent = this.readFile(filePath),
        subParent = pathsys.dirname(filePath),
        returnFilePath = null;
    
    // 重复引用的，直接返回
    if (this.handled[filePath]) {
        return null;
    }
    
    // 第一次引入的做一个标记
    this.handled[filePath] = 1;

    var obj = {
        filePath: filePath,
        key: encyptPath,
        isModule: isModule
    }    

    if (!fileContent.content) {
        requireList.push({
            filePath: filePath,
            error: 'file not found'
        });
        
        return requireList;
    }

    var imports = fileContent.content.match(this.patterns.requirePattern);

    if (!imports) {
        requireList.push(obj);
        return requireList;
    }

    // 分析文件里的递归require
    for (var i = 0, item, subFile = null, tempPath = null; i < imports.length; i++) {
        imports[i].match(this.patterns.pathPattern);

        tempPath = RegExp.$1;
        this.getRequireList(tempPath, subParent, requireList);
    }
    
    return requireList;
}

RequireHandler.prototype.configDataPrefix = function (configData) {
    
}

RequireHandler.prototype.isCss = function (params) {

}

module.exports = RequireHandler;