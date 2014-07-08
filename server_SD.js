var express = require('express');
var app=express();
var server = require('http').createServer(app);
var fs = require('fs');
var lazy = require("lazy");


var tasks={};
var users={
		"admin":{region:"God",power:"admin",password:"admin9527",taskLists:[]},
		"zhoumj":{region:"省公司",power:"admin",password:"zhoumj",taskLists:[]},
		"zhaobin":{region:"省公司",power:"admin",password:"zhaobin52",taskLists:[]},
//		"zhaobin":{region:"省公司",password:"zhaobin52",taskLists:[]},
		"jinancc":{region:"济南",password:"jinan0531",taskLists:[]},
		"qingdaocc":{region:"青岛",password:"qingdao0532",taskLists:[]},
		"zibocc":{region:"淄博",password:"zibo0533",taskLists:[]},
		"zaozhcc":{region:"枣庄",password:"zaozh0632",taskLists:[]},
		"dongyingcc":{region:"东营",password:"dongying0546",taskLists:[]},
		"yantaicc":{region:"烟台",password:"yantai0535",taskLists:[]},
		"weifangcc":{region:"潍坊",password:	"weifang0536",taskLists:[]},
		"jiningcc":{region:"济宁",password:"jining0537",taskLists:[]},	
		"taiancc":{region:"泰安",password:"taian0538",taskLists:[]},		
		"weihaicc":{region:"威海",password:"weihai0631",taskLists:[]},
		"rizhaocc":{region:"日照",password:"rizhao0633",taskLists:[]},
		"binzhoucc":{region:"滨州",password:"binzhou0543",taskLists:[]},
		"dezhoucc":{region:"德州",password:"dezhou0534",taskLists:[]},
		"liaochcc":{region:"聊城",password:"liaoch0635",taskLists:[]},
		"linyicc":{region:"临沂",password:"linyi0539",taskLists:[]},		
		"hezecc":{region:"菏泽",password:"heze0530",taskLists:[]},
		"laiwucc":{region:"莱芜",password:"laiwu0634",taskLists:[]},
		"demo":{region:"demo",password:"demo",taskLists:[]},
/////这三个被zhaobin管理   
    "dzrb":{region:"大众日报社",password:"dzrb0639",taskLists:[]},
		"sjt":{region:"山东手机台",password:"sjt0640",taskLists:[]},
		"nxt":{region:"农信通",password:"nxt0641",taskLists:[]},

};


var uuid=0;
var user_login="demo";

//每页显示的数量
var numPerPage = 50;

//记录操作日志的核心函数
var dbLog=function(log){
	console.log("数据库操作日志: "+log);
	fs.appendFile('modifiedDataOp.log', log+"\n", function (err) {
	  if (err) throw err;
	  console.log('The "data to append" was appended to file!');
	});
};

//从数据库日志文件恢复数据的核心初始化过程

var stream = fs.createReadStream('modifiedDataOp.log');
stream.on('end', function(data){
//    users['zhaobin'].taskLists = users['dzrb'].taskLists.concat(users['sjt'].taskLists, users['nxt'].taskLists);    
    });
 new lazy(stream)
     .lines
     .forEach(function(line){
         eval(line.toString());
     }
 );



var syncTofs=function(){

	fs.writeFile('tasks.json', JSON.stringify(tasks), function (err) {
  		if (err) throw err;
  			console.log('tasks.json saved');
	});
	fs.writeFile('users.json', JSON.stringify(users), function (err) {
  		if (err) throw err;
  			console.log('users.json saved');
	});
},syncFromfs=function(){
	fs.readFile('database.json', function (err, data) {
  		if (err) throw err;
  		console.log(data);
  		tasks=JSON.parse(data);
	});
};

//每半小时写一次数据库
setInterval(function(){
	syncTofs();
},1000*60*30);

//这句很关键，没有它，POST解析就无法进行
app.use(express.bodyParser({}));

//将三个重要文件屏蔽掉
app.get('/server.js',function(req,res){
	res.send("???????");
});
app.get('/tasks.json',function(req,res){
	res.send("???????");
});
app.get('/users.json',function(req,res){
	res.send("???????");
});

app.use('/', express.static(__dirname + '/'));

var port = 9527;
server.listen(port);
console.log('Listening Port ' + port);



//原子性操作，客户端取得某记录的唯一键值，自增的
app.get('/uuid', function (req, res) {
  uuid++;
  dbLog("uuid++;");
  res.send(JSON.stringify(uuid));
});

//取得某用户下tasks列表的长度，用来做分页逻辑的
app.post('/tasks_length', function (req, res) {
  var user_login=req.body.user_login;
  //用户有误，直接退回	
  if(users.hasOwnProperty(user_login)){
      //处理zhaobin的情况
      var length = 0;
      //----------------------fuck zhaobin-------------------
      if(user_login == 'zhaobin'){
//        console.log(users['dzrb'].taskLists.length +'-'+ users['sjt'].taskLists.length +'-'+ users['nxt'].taskLists.length);
        length = users['dzrb'].taskLists.length + users['sjt'].taskLists.length + users['nxt'].taskLists.length;
      //---------------------------fuck zhaobin--------------
      }else{
    		length=users[user_login].taskLists.length;
      }
  			res.send(JSON.stringify(length));
  }else{
	  		res.redirect("/");  	
  }
});

//取得任务，需要添加认证，选择范围，以及取得某用户的记录的功能
app.post('/tasks', function (req, res) {
	var start=req.body.start;
	var offset=req.body.offset;
	var user_login=req.body.user_login;
  console.log('start='+start+' ,offset='+offset);

 //返回值应该为Array  奇怪返回对象后AngularJS也能正确解析数据,只不过filter失效
//	var range_tasks={};
  var range_tasks=[];
//	var list_length=users[user_login].taskLists.length;
	var _uuid=0;
   
  //----------------------fuck zhaobin-------------------
      if(user_login == 'zhaobin'){
//        var tmpUUIDS = users['dzrb'].taskLists.concat(users['sjt'].taskLists, users['nxt'].taskLists);
      //为了让zhaobin看到的不是 AAAAAABBBBBCCCCC的排列, 而是ABCABCABCAB...  每个人提交的交替出现, 不能直接concat, 按每个人最新提交的循环unshift
      var tmpUUIDS = new Array;
      for(var z=1; z<=Math.max(users['dzrb'].taskLists.length, Math.max(users['sjt'].taskLists.length, users['nxt'].taskLists.length)); z++){
        if(users['dzrb'].taskLists[users['dzrb'].taskLists.length - z] != undefined)   tmpUUIDS.unshift(users['dzrb'].taskLists[users['dzrb'].taskLists.length - z]);
        if(users['sjt'].taskLists[users['sjt'].taskLists.length - z]   != undefined)   tmpUUIDS.unshift(users['sjt'].taskLists[users['sjt'].taskLists.length - z]);
        if(users['nxt'].taskLists[users['nxt'].taskLists.length - z]   != undefined)   tmpUUIDS.unshift(users['nxt'].taskLists[users['nxt'].taskLists.length - z]);
      }

        for(var i=start; i>start-offset; i--){
          _uuid = tmpUUIDS[i];
          if(i<0) continue;
      
          if(tasks[_uuid] != null){
            range_tasks.unshift(tasks[_uuid]);  
          }
        } //End of for

      }  //End of zhaobin coming
  //---------------------------fuck zhaobin--------------
      else {                                               
        	for(var i=start; i>start-offset; i--){
        		_uuid = users[user_login].taskLists[i];
            if(i<0) continue;     //最后一页的负值部分直接跳过
        
            if(tasks[_uuid] != null){
        //       range_tasks[_uuid]=tasks[_uuid];      这里不能直接=赋值  必须push 数组index跳空
                range_tasks.unshift(tasks[_uuid]);
            }
        	}
      }   //End of anybody besides zhaobin

  res.send(JSON.stringify(range_tasks));
});

//增加一条任务
app.post('/task_add', function (req, res) {
	var uuid=req.body.uuid;
	var newTask=req.body.newTask;
	var user_login=req.body.user_login;
  		tasks[uuid]=newTask;
  		tasks[uuid]._id=uuid;
  		tasks[uuid].region=users[user_login].region;
  		tasks[uuid].tOperator=user_login;
  //用户有误，直接退回	
  if(users.hasOwnProperty(user_login)){
  		var length=users[user_login].taskLists.length;
  			res.send(JSON.stringify(length));
  }else{
	  		res.redirect("/");  	
  }
  //永远不要相信客户端的录入
  if (newTask!=null && newTask!=undefined) {

  	if (newTask.tPriv="") {tasks[uuid].tPriv=0};

  	dbLog("tasks["+uuid+"]="+JSON.stringify(tasks[uuid])+";");

  	//如果用户不是超级用户，则同时要向admin用户的列表和普通用户的列表中同时添加值，以索引
  	if(users[user_login].power!="admin"){
  		users[user_login].taskLists.push(uuid);
  		dbLog("users['"+user_login+"'].taskLists.push("+uuid+");");
  		 //这里有bug
  		 users["admin"].taskLists.push(uuid);
  		 users["zhoumj"].taskLists.push(uuid);
       users["zhaobin"].taskLists.push(uuid);
  		 dbLog("users['admin'].taskLists.push("+uuid+");");
  		 dbLog("users['zhoumj'].taskLists.push("+uuid+");");
       dbLog("users['zhaobin'].taskLists.push("+uuid+");");
  	}else{
  		 //这里有bug
  		 users["admin"].taskLists.push(uuid);
  		 users["zhoumj"].taskLists.push(uuid);
       users["zhaobin"].taskLists.push(uuid);
  		 dbLog("users['admin'].taskLists.push("+uuid+");");
  		 dbLog("users['zhoumj'].taskLists.push("+uuid+");"); 
       dbLog("users['zhaobin'].taskLists.push("+uuid+");");
  	}
  	//console.log(tasks);
  	res.send(JSON.stringify(tasks[uuid]));
  	}//end of check newTask input
});


//删除某条未经审核的任务
app.post('/task_delete', function (req, res) {
	//{_id:_id,start:$scope.page_now,offset:page_offset,user_login:user_cookies.user})
	var del_id=req.body._id;
	var user_login=req.body.user_login;
	//TODO:加上数据库日志，另外需要在用户和两个admin用户的tasksList里搜索这个id并剔除
	if(tasks.hasOwnProperty(del_id)){
			delete tasks[del_id];
			dbLog("delete tasks["+del_id+"];");
			var userIndex=users[user_login].taskLists.indexOf(del_id);
			var adminIndex=users["admin"].taskLists.indexOf(del_id);
				users[user_login].taskLists.splice(userIndex, 1);
				users["admin"].taskLists.splice(adminIndex, 1);
				users["zhoumj"].taskLists.splice(adminIndex, 1);
        users["zhaobin"].taskLists.splice(adminIndex, 1);
			dbLog("users["+user_login+"].taskLists.splice("+userIndex+", 1);");
			dbLog("users['admin'].taskLists.splice("+adminIndex+", 1);");
			dbLog("users['zhoumj'].taskLists.splice("+adminIndex+", 1);");
      dbLog("users['zhaobin'].taskLists.splice("+adminIndex+", 1);");
	}else{
			throw "can not find del_id";
	}
});//END of 删除某条状态

//更新某条的状态  执行审核啊
app.post('/updateStatuByID', function (req, res) {
	var _id=req.body.originId;
	var statu=req.body.statu;
	console.log(req.body);

	if (_id!=null && _id!=undefined && tasks.hasOwnProperty(_id) ) {
		tasks[_id].statu=statu;
		dbLog("tasks["+_id+"].statu="+JSON.stringify(statu)+";");
    res.send('OOKK');
	}else{
		console.log("not found~~");
	}

});

//用户的认证问题
app.post('/verfy_user', function (req, res) {
	var usr=req.body.usr;
	var pass=req.body.pass;

	if(pass===users[usr].password){
		users[usr].lastLogin=Date.now();
		res.send({user   : usr, 
              region : users[usr].region,
              power  : users[usr].power}
            );
	}
});
