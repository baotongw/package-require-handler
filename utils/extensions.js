/**
 *	@author: baotong.wang
 *	@lastModify：baotong.wang
 *	@lastModiftDate: 2015-11-10
 *	@fileoverview: 对字符串的功能扩展
 *	@dependence：无
 *	@other：无
 */

// 扩展字符串，增加一个format函数做模板替换时使用
// extend the string prototype, add a format function to do string.format
String.prototype.format = function(args) {
	var result = this,
		pattern;

	if (args && arguments.length > 0) {
		//var template = "我是{name}，今年{age}了";
		//var result = template.format({name:"loogn",age:22});
		if (arguments.length === 1 && typeof(args) === 'object') {
			for (var key in args) {
				if (args[key] !== undefined) {
					pattern = new RegExp('({' + key + '})', 'g');

					result = result.replace(pattern, args[key]);
				}
			}
		} else {
			// var template = "我是{0}，今年{1}了";
			// var result = template.format("loogn",22);
			for (var i = 0; i < arguments.length; i++) {
				if (arguments[i] != undefined) {
					var reg = new RegExp("({)" + i + "(})", "g");
					result = result.replace(reg, arguments[i]);
				}
			}
		}
	}

	return result;
}