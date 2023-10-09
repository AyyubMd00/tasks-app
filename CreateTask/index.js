const jwt = require('jsonwebtoken');
const { v4: uuid4 } = require('uuid');
const fs = require('fs');

module.exports = async function (context, req) {
    if (!req.body) {
        let response = {
            status: 400,
            body: "Request body is missing!"
        };
        context.res.status(400).json(response);
        return;
    }
    
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
    if (!req.body.title) {
        let response = {
            status: 400,
            body: "Title is missing!"
        };
        context.res.status(400).json(response);
        return;
    }
    if (req.body.description !== undefined && typeof req.body.description !== 'string') {
        let response = {
            status: 400,
            body: "Wrong description type!"
        };
        context.res.status(400).json(response);
        return;
    }
    if (!req.body.priority || typeof req.body.priority !== 'number' || req.body.priority<1 ||req.body.priority>3) {
        let response = {
            status: 400,
            body: "Missing or wrong priority!"
        };
        context.res.status(400).json(response);
        return;
    }
    let statuses = ['to-do', 'in-progress', 'done'];
    if (!req.body.status || !statuses.includes(req.body.status)) {
        let response = {
            status: 400,
            body: "Missing or wrong status!"
        };
        context.res.status(400).json(response);
        return;
    }

    const tasksDataFilePath = 'tasks.json';

    const data = fs.readFileSync(tasksDataFilePath, 'utf-8');
    const tasksData = JSON.parse(data);

    let duplicateTask = tasksData.find((task) => task.user_id === userId && task.title === req.body.title);
    if (duplicateTask) {
        let response = {
            status: 400,
            body: `Task with title '${req.body.title}' already exists!`
        };
        context.res.status(400).json(response);
        return;
    }

    let currentTime = new Date();
    let currentTimeInISO = currentTime.toISOString()
    let task = {
        'id': uuid4(),
        'user_id': userId,
        'title': req.body.title,
        'description': req.body.description || '',
        'priority': req.body.priority,
        'priority_history': [{
            'priority': req.body.priority,
            'timestamp': currentTimeInISO
        }],
        'status': req.body.status,
        'status_history': [{
            'status': req.body.status,
            'timestamp': currentTimeInISO
        }],
        'created_timestamp': currentTimeInISO
    }
    
    tasksData.push(task);
    const tasksJson = JSON.stringify(tasksData);

    fs.writeFileSync(tasksDataFilePath, tasksJson);

    let response = {
        status: 200,
        body: "Task has been added!"
    };
    context.res.status(200).json(response);
}