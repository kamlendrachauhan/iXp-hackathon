'use strict';

angular.module('botapp', [])
.controller("bot-controller", function($scope)  {
    // $scope.submit = function()  {
    //     var socket = window.io.connect("http://localhost:5000");
    //     socket.emit("message", $scope.question);
    //     socket.on("response", function(data)    {
    //         alert(data);
    //     });
    // };
    $scope.tryTicky = function(){
      $('#tickey-desc').css('display','none');
      $('#tickey-chat').css('display','block');
    };
});
