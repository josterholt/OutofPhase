var Client = function () {
    this.triggerQueue = {}
    this.messageQueue = [];
    // Add trigger to queue. This will be sent next update
    this.queueTrigger = function (name, obj1, obj2) {
        console.debug("Queueing trigger: " + name)
        var data = {};
        data['name'] = name;

        // Extract needed info from objects
        data['object1'] = {
            "target": obj1.target,
            "group": obj1.group
        }

        data['object2'] = {
            "target": obj2.target,
            "group": obj2.group
        }
        this.triggerQueue[obj1.id + obj2.id] = {"action": "runTrigger", "data": data };
    }

    this.pendingEventsByObject = {}
    this.queueObjectEvent = function (obj) {
        request = {"action": "updateObject", "data": { "id": obj.id, "x": obj.body.x, "y": obj.body.y }}; // May want to just update based on sprite x/y. Sticking with body in case those are different.

        var index;
        if(!(obj.id in this.pendingEventsByObject)) {
            index = this.messageQueue.push(request);
            this.pendingEventsByObject[obj.id] = index;

        } else {
            index = this.pendingEventsByObject[obj.id];
            this.messageQueue[index] = request;
        }
    }

    this.queueRequest = function (request) {
        this.messageQueue.push(request);
    }

    this.sendQueueMessages = function () {
        var finalQueue = [];
        for(var i in this.messageQueue) {
            finalQueue.push(this.messageQueue[i]);
        }

        for(var i in this.triggerQueue) {
            finalQueue.push(this.triggerQueue[i]);
        }

        if(finalQueue.length > 0) {
            this.send(finalQueue);
        }

        this.messageQueue = [];
        this.triggerQueue = {};
    }

    this.send = function (data) {
        if(typeof(data) != "string") {
            var requests = JSON.stringify(data);
        } else {
            var requests = data;
        }

        ws.send(requests)
    }
}