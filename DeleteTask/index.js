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
    context.log(req.query)
    if (!req.query.id) {
        let response = {
            status: 400,
            body: "Id is Missing!"
        };
        context.res.status(400).json(response);
        return;
    }

    const tasksDataFilePath = 'tasks.json';

    const data = fs.readFileSync(tasksDataFilePath, 'utf-8');
    const tasksData = JSON.parse(data);

    let updatedTasksData = []
    let isTaskFound = false
    tasksData.forEach(taskElement => {
        if (taskElement.user_id !== userId || taskElement.id !== req.query.id) {
            updatedTasksData.push(taskElement);
        }
        else isTaskFound = true;
    });
    context.log(isTaskFound);

    if (!isTaskFound) {
        let response = {
            status: 400,
            body: "Task not found!"
        };
        context.res.status(400).json(response);
        return;
    }

    const tasksJson = JSON.stringify(updatedTasksData);

    fs.writeFileSync(tasksDataFilePath, tasksJson);
    let response = {
        status: 200,
        body: "Task has been deleted!"
    };
    context.res.status(200).json(response);
    return;
}