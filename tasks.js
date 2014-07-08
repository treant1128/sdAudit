var myApp = angular.module('myApp', []).filter('weDontLike', function(){
    
    return function(items, name){
        
        var arrayToReturn = [];
        //console.log(items);
        for (var key in items) {
           if(items[key]){
            arrayToReturn.push(key);
           }
        }
        return arrayToReturn;
    };
});



function TasksCtrl($scope,$http) {
 
  $scope.orderProp = '_id';  //确定排序规则

  var user_cookies = {};
  
  //普通用户每页显示20条
  var page_offset = 20;

  if(sessionStorage["audit_SD"]){
    user_cookies = JSON.parse(sessionStorage["audit_SD"]);
    $scope.user = user_cookies.user;
    $scope.region = user_cookies.region;
    //管理员每页显示50条
    if(user_cookies.power === 'admin'){
      page_offset = 50;
      if(user_cookies.user === 'zhaobin'){
        page_offset = 10;
      }
    }
  } else{
    window.location = "/";
  }

  var init=function(){

          $scope.userType = {};
          $scope.userType['3G-iPhone'] = false;
          $scope.userType['2G-iPhone'] = false;
          $scope.userType['3G-Android'] = false;
          $scope.userType['2G-Android'] = false;
          $scope.userType['3G-活跃'] = false;
          $scope.userType['2G-活跃'] = false;
          $scope.userType['3G-非活跃'] = false;
          $scope.userType['2G-非活跃'] = false;
          $scope.userType['3G-沉默'] = false;
          $scope.userType['2G-沉默'] = false;
          $scope.userType['地市提供号码包'] = false;

          $scope.tHeader = '';
          $scope.tURL = '';
          $scope.tDateTime = '';
          $scope.tPriv = 0;
  };

  init();

  //更新某条目状态的内部辅助函数，由autitYes,deny来调用
  var updateStatuByID = function(originId, statu){

      $http.post('/updateStatuByID',{originId : originId, statu : statu}).success(function(data) {
          alert('审核完成 !');
      });

  };
  
   var updatePages = function(start){
  
     //$scope.curentPage已经在loadPage中由temp赋值(不超出页码范围)
     //无需再根据start及page_offset去计算$scope.currentPage了
     //下面这行是当直接传入start(不是逐页变化)时的计算方法(注释掉的前端分页逻辑)
//      $scope.currentPage = ($scope.length - start) / page_offset + 1;
     
      $http.post('/tasks',{start :start, offset : page_offset, user_login : user_cookies.user}).
            success(function(data) {
              //不能直接=赋值  id有跳空现象  必须在循环中push
              //                $scope.tasks = data;     console.log(($scope.tasks).length);
              $scope.tasks=[];
              console.log(data);
              for(var i=0; i<data.length; i++){
                data[i].originId = data[i]._id;
                if(start > page_offset){      //对跳乱的_id进行规整
                  data[i]._id = start - (page_offset - i) + 1;   
                }else{
                  data[i]._id = i + 1;
                }
//                console.log(data[i]._id);
                $scope.tasks.push(data[i]);
              }
                console.log($scope.tasks);
          });//end of update $scope.tasks;
  };

   $http.post('/tasks_length/', 
          {user_login : user_cookies.user}).
          success(function(data){
              console.log(data);
            $scope.length = data;
            var pages_calc = Math.ceil($scope.length/page_offset);
            console.log(pages_calc);
            $scope.pages = [];
            
            for(var i=0; i<pages_calc; i++){
              var pageInfo = {};
              pageInfo.start = $scope.length -i*page_offset;
              pageInfo.pageNumber = i+1;
              $scope.pages.push(pageInfo);
            }
            console.log($scope.pages);

            //初始化完成后默认进入第一页  start为最后一个task
            $scope.currentPage = 1;
            updatePages($scope.length);
      });//end of post success

   //分页查看，响应用户点击分页按钮
   $scope.loadPage=function(start){
     if(!isNaN(start)){
       //点击上一页/下一页时触发此逻辑  注释掉的前端直接进入某一页的分页逻辑直接传入不是1, -1的参数start
       if(start === -1 || start === 1){
         var temp = $scope.currentPage + start;
         console.log(temp);
         if(temp < 1){
          alert('当前已是第一页!');
          return;
         }else if(temp > $scope.pages.length){
          alert('当前已是最后一页!');
          return;
         }
         $scope.currentPage = temp;
         temp = null;
         start = $scope.pages[$scope.currentPage - 1].start; //只有start=1或-1才能直接当页数去计算
         console.log(start);
       }

       updatePages(start);
     }
   };

  //增加一个计划
  $scope.addSendPlan = function() {
    console.log($scope.tasks);
    console.log("I'm Coming!");
    //首先向服务器取得uuid，而后加入信息条目
    var orAllUserTypeValue = false;  //用来检测用户是否一个userType都没点就想提交
    for(p in $scope.userType){
      orAllUserTypeValue |= $scope.userType[p];
    }

    if(!orAllUserTypeValue){
      alert('请至少选择一个用户属性 ~~');
      return;
    }
    console.log($scope.tHeader+'-'+$scope.tURL+'-'+$scope.tDateTime+'-'+$scope.tPriv+'-'+$scope.tComment);
    if($scope.tHeader == ''){
      alert('请输入下发标题 !');
      return;
    }else if($scope.tURL == ''){
      alert('请输入URL !');
      return;
    }else if($scope.tDateTime == 0){
      alert('请选择下发日期 !');
      return;
    }

    console.log($scope.tasks);
    $http.get('/uuid').success(function(data) {
        console.log(data);
        uuid = data;
        console.log("$scope.tPriv:" + $scope.tPriv);
        if($scope.tPriv === 0 || $scope.tPriv === undefined){
          $scope.tPriv = "市分优先"
        };
        var newTask={userType : $scope.userType, tHeader : $scope.tHeader, tURL : $scope.tURL, tDateTime : $scope.tDateTime, tPriv : $scope.tPriv, statu : {audit : "info", icon : "icon-info-sign"}, region : user_cookies.region, tOperator : user_cookies.user, tComment : $scope.tComment};

          //更改客户端内存中的数值
      //    $scope.tasks[uuid] = newTask;
      //    $scope.tasks[uuid]._id = uuid;
          console.log(newTask);
          $scope.tasks.unshift(newTask);  

          //更改服务器端的数值
          $http.post('/task_add', {uuid : uuid, newTask : newTask, user_login : user_cookies.user}).
           success(function(data) {
              //最终其实还是使用了服务端验证，并返回记录并更新本地内存的方式
              //newTask只是一个初始化的模版
              //$scope.tasks[uuid]=data;
               $("#myModal").modal("hide");
          });

          init();
          console.log($scope.tasks);
       }); //END of get uuid
  };  //END of addSendPlan

  $('#datepicker').change(function(){
      var dd = $(this).val();
      console.log(dd);
      $scope.$apply(function(){
            $scope.tDateTime = dd;
      }); //End of scope.apply
  });

  //删除任务   暂时不起作用的
  $scope.delTask = function(_id){
    console.log(_id);
    console.log($scope.tasks);
      //    if ($scope.tasks[_id].statu.audit === "info"){
      // $http.post('/task_delete',{_id:_id,user_login:user_cookies.user}).
      //   success(function(data) { 
      //       delete $scope.tasks[_id];
      // });
      if(1){
            alert("暂时不允许删除.....");
    }else{
            alert("已审核项目无法删除.....");
    }
  };

  //审核通过
  $scope.auditTask = function(_id, originId) {
    if(confirm("确认审核通过么？")){
 //     console.log(_id + "---" + originId);
 //     前面_id = start - (page_offset - i) + 1  现在要反过来根据_id和start求得在本页的顺序 i = _id + page_offset - start -1
 //     var i = _id + page_offset - $scope.pages[$scope.currentPage - 1].start - 1;
 //     console.log(i);
 //     不用再去费尽心思地转换id  originId  pageStart等等了   用暴力for循环 一个一个遍历
      
      console.log($scope.tasks);
      if(originId != null || originId != undefined){
  //      $scope.tasks[i].statu = {audit : "success", icon : "icon-ok"};
          for(t in $scope.tasks){
            if(originId === $scope.tasks[t].originId){
              $scope.tasks[t].statu = {audit : "success", icon : "icon-ok"}; 
              updateStatuByID(originId, {audit : "success", icon : "icon-ok"});
              continue;
            }
          }
      }else{
        console.log("Not found~~");
      }
    }
  };

  //否决该审核
  $scope.denyTask = function(_id, originId) {
    if(confirm("确认否决审核么？")){
       if(originId != null || originId != undefined){
         for(t in $scope.tasks){
               if(originId === $scope.tasks[t].originId){
                 $scope.tasks[t].statu = {audit : "error", icon : "icon-remove"};
                 updateStatuByID(originId, {audit : "error", icon : "icon-remove"});
                 continue;
               }
          }
       }else{
         console.log("Not found~~");
       }
    }
  };

  //登出
  $scope.Logout = function() {
    sessionStorage["audit_SD"]="";
    window.location="/";
  };

    //测试
  $scope.isTrue = function() {
    console.log("falsdkjflakjsdf");
  };


  //数据的初始化
  //首先得到整个表的条目数量，取users[user_login].tasksList.length
  //然后根据每页面50，倒排得去服务器取数据
  //另外只能取该用户自身的数据，别人的数据他不应该能看到
  //当然power===admin的用户，就随便了
//  updatePages($scope.length);
}
