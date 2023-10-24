var app = (function () {

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    var stompClient = null;

    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI);
        ctx.stroke();
    };

    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    var connectAndSubscribe = function (callback, number) {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe(`/topic/newpoint.${number}}`, function (eventbody) {
                var theObject = JSON.parse(eventbody.body);
                addPointToCanvas(theObject);
            });
        });
    };

    return {
        conect: function (number) {
            console.log(number);
            var canvas = document.getElementById("canvas");
            canvas.addEventListener("click", function(evt) {
                var mousePosition = getMousePosition(evt);
                console.log(mousePosition);
                app.publishPoint(mousePosition.x, mousePosition.y,number);
            });
            connectAndSubscribe(addPointToCanvas, number); 
        },

        publishPoint: function (px, py, number) {
            var pt = new Point(px, py);
            console.info("publishing point at " + pt);
            addPointToCanvas(pt);
            stompClient.send(`/topic/newpoint.${number}}`, {}, JSON.stringify(pt));
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };
})();

