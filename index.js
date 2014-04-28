var restler = require('restler');
var q = require('q');
var crypto = require('crypto');

var Mutong = function(option){
	this.accessKey = option.accessKey;
	this.secretKey = option.secretKey;

}

Mutong.prototype.upload = function(file,size,key,policy){
	var deferred = q.defer();

	var postdata = {};
	postdata["token"] = createUploadToken(policy,this.accessKey,this.secretKey);
		
	if(key){
		postdata["key"] = key; 
	}
	postdata["file"] = restler.file(file,null,size)
	

	restler.post('http://up.qiniu.com',{
			multipart:true,
			data:postdata
			
		}).on('success',function(data){
			data.file = file;
			console.log("file " + file + " uploaded to qiniu");
			console.log(data);
			deferred.resolve(data);
			
		}).on('fail',function(err){
			deferred.reject(new Error(JSON.stringify(err)));
		}).on('error',function(error){
			deferred.reject(error);
		}).on('timeout',function(){
			deferred.reject(new Error("upload is timeout"));
	});		
	return deferred.promise;
}
var createUploadToken = function(policy, accessKey, secretKey){
	var encodedPolicy = safeBase64(JSON.stringify(policy));

	var hmac = crypto.createHmac("sha1", secretKey);

	var sign = safeBase64(hmac.update(encodedPolicy).digest());

	var token = accessKey + ":" + sign + ":" + encodedPolicy;

	return token;
}

function safeBase64(str){
	var result = new Buffer(str).toString('Base64');
	result = result.replace(/\+/g,'-');
	result = result.replace(/\//g,'_');
	return result;
	
}

module.exports = Mutong;