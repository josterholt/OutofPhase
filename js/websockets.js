var ws = new WebSocket('ws://ubuntu/statesync', ['soap', 'xmpp']);

ws.onopen = function () {
    ws.send('Ping');
}

ws.onerror = function (error) {
    console.debug('Websocket Error ' + error);
}

ws.onmessage = function (e) {
    console.debug('Server: ' + e.data);
}