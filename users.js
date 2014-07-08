function UserCtrl($scope,$http) {
  var now_where_I_am=window.location;


  var user_cookies={};
  if(sessionStorage["audit_SD"]){
    user_cookies=JSON.parse(sessionStorage["audit_SD"]);
  }else{

  }

  if(now_where_I_am){
	  if(user_cookies.user!=null || user_cookies.user!=undefined){
	  		$scope.username=user_cookies.user;
	  }
	}else{
		
	}

  $scope.verfy_user=function(){
//  	alert("fasdfasdfasdfasdfasdfasdfasdf");
   var data={usr:$scope.username,pass:$scope.password};
   console.log(data);
   if ($scope.username!="" && $scope.password!="") {
   	console.log("hi.....I am not nulll......");
  	  $http.post('/verfy_user', data).success(function(data) {
  	  		console.log(data);
          if(data.power==="admin"){
            sessionStorage["audit_SD"]=JSON.stringify(data);
            window.location="auditAdmin.html";
          } else{
            sessionStorage["audit_SD"]=JSON.stringify(data);
            window.location="auditResult.html";
          }
  	  });//end of http post method
  	}//end of if usr and password input textbox not null

  }//end of verfy_user function

  $scope.logout=function(){


  }//end of verfy_user function

}
