/**
 * Created by i854911 on 7/13/16.
 */

angular.module('chatbotapp', [])
    .controller('chat-controller', function($scope, $http) {
        $scope.submit=function()    {
            var socket = io.connect('http://localhost:3000');
            socket.emit('message', $scope.question);
            socket.on('response', function(data)    {
                alert(data);
            })

            /*$http.post("/message", {
                "user_id" : 11,
                "text": $scope.question
            }).then(function(response)  {
                alert("Got Response");
            })*/
        }
    });
