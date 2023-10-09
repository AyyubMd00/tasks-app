const jwt = require('jsonwebtoken');
const fs = require('fs');

module.exports = async function (context, req) {    
    const { authorization } = req.headers;
    if (!authorization) {
        let response = {
            status: 403,
            body: "Missing Authorization Header!"
        };
        context.res.status(403).json(response);
        return;
    }
    const token = authorization.split(" ")[1];
    let userId;
    try {
        const credentials = jwt.verify(token, process.env["JWTSecretKey"]);
        userId = credentials.id;
    }
    catch {
        let response = {
            status: 403,
            body: "Invalid Token!"
        };
        context.res.status(403).json(response);
        return;
    }

    if (!req.body) {
        let response = {
            status: 400,
            body: "Request body is missing!"
        };
        context.res.status(400).json(response);
        return;
    }

    context.log(req.body);
    if (!req.body.id) {
        let response = {
            status: 400,
            body: "Id is missing!"
        };
        context.res.status(400).json(response);
        return;
    }

    if (req.body.title === undefined && req.body.description === undefined && !req.body.status && !req.body.priority) {
        let response = {
            status: 400,
            body: "Nothing to update!"
        };
        context.res.status(400).json(response);
        return;
    }

    const tasksDataFilePath = 'tasks.json';

    const data = fs.readFileSync(tasksDataFilePath, 'utf-8');
    const tasksData = JSON.parse(data);

    let task = tasksData.find(taskElement => taskElement.user_id === userId & taskElement.id === req.body.id);
    // context.log(task)
    // context.log(userId)
    if (!task) {
        let response = {
            status: 400,
            body: "Task not found!"
        };
        context.res.status(400).json(response);
        return;
    }

    if (req.body.title !== undefined && !req.body.title.length) {
        let response = {
            status: 400,
            body: "Title can't be empty!"
        };
        context.res.status(400).json(response);
        return;
    } else {
        task.title = req.body.title;
    }
    if (req.body.description !== undefined) {
        if (typeof req.body.description !== 'string') {
            let response = {
                status: 400,
                body: "Wrong description type!"
            };
            context.res.status(400).json(response);
            return;
        }
        task.description = req.body.description;
    }

    let currentTime = new Date();
    let currentTimeInISO = currentTime.toISOString()

    if (req.body.status !== undefined) {
        let statuses = ['to-do', 'in-progress', 'done'];
        context.log(!statuses.includes(req.body.status))
        if (!statuses.includes(req.body.status)) {
            let response = {
                status: 400,
                body: "Missing or wrong status!"
            };
            context.res.status(400).json(response);
            return;
        }
        if (task.status !== req.body.status) {
            task.status = req.body.status;
            task.status_history.push({
                status: req.body.status,
                timestamp: currentTimeInISO
            })
        }
    }

    if (req.body.priority !== undefined) {
        if (typeof req.body.priority !== 'number' || req.body.priority<1 ||req.body.priority>3) {
            let response = {
                status: 400,
                body: "Missing or wrong priority!"
            };
            context.res.status(400).json(response);
            return;
        }
        if (task.priority !== req.body.priority) {
            task.priority = req.body.priority;
            task.priority_history.push({
                priority: req.body.priority,
                timestamp: currentTimeInISO
            })
        }
    }

    let updatedTasksData = []
    tasksData.forEach(taskElement => {
        updatedTasksData.push(taskElement.id === task.id ? task : taskElement)
    });

    const tasksJson = JSON.stringify(updatedTasksData);

    fs.writeFileSync(tasksDataFilePath, tasksJson);

    let response = {
        status: 200,
        body: "Task has been updated!"
    };
    context.res.status(200).json(response);

}