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
    
    const tasksDataFilePath = 'tasks.json';

    const data = fs.readFileSync(tasksDataFilePath, 'utf-8');
    const tasksData = JSON.parse(data);

    let tasksList = tasksData.filter(task => task.user_id === userId).map(task => {
        return {
            "id": task.id,
            "user_id": task.user_id,
            "title": task.title,
            "status": task.status,
            "priority": task.priority
        }
    });
    
    // context.log("tasks", tasksList)
    // context.log(tasksList.length)
    if (!tasksList.length) {
        let response = {
            status: 400,
            body: "No saved tasks!"
        };
        context.res.status(400).json(response);
        return;
    }
    let response = {
        status: 200,
        body: tasksList
    };
    context.res.status(200).json(response);
    return;
}