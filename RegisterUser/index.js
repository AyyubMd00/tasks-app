const fs = require('fs');
const { v4: uuid4 } = require('uuid');
const bcrypt = require('bcrypt');
const validator = require("../utils/Validator");
const saltRounds = 10;

module.exports = async function (context, req) {
    if (!req.body) {
        let response = {
            status: 400,
            body: "Request body is missing!"
        };
        context.res.status(400).json(response);
        return;
    }
    
    if (!req.body.email) {
        let response = {
            status: 400,
            body: "Email is missing!"
        };
        context.res.status(400).json(response);
        return;
    }
    if (!req.body.password) {
        let response = {
            status: 400,
            body: "Password is missing!"
        };
        context.res.status(400).json(response);
        return;
    }
    if (!req.body.name) {
        let response = {
            status: 400,
            message: "Name is missing!"
        };
        context.res.status(400).json(response);
        return;
    }
    if (typeof(req.body.name) !== 'string') {
        let response = {
            status: 400,
            message: "Name should be a string!"
        };
        context.res.status(400).json(response);
        return;
    }
    if (!validator.validateName(req.body.name)) {
        let response = {
            status: 400,
            message: "Name should not have any special characters!"
        };
        context.res.status(400).json(response);
        return;
    }
    if (!req.body.age) {
        let response = {
            status: 400,
            body: "Age is missing!"
        };
        context.res.status(400).json(response);
        return;
    }

    if (!validator.validateEmail(req.body.email)) {
        let response = {
            status: 400,
            body: "Invalid Email!"
        };
        context.res.status(400).json(response);
        return;
    }
    if (!validator.validatePassword(req.body.password)) {
        let response = {
            status: 400,
            body: "Invalid Password!"
        };
        context.res.status(400).json(response);
        return;
    }
    if (req.body.age < 10) {
        let response = {
            status: 400,
            body: "Age must be greater than or equal to 10!"
        };
        context.res.status(400).json(response);
        return;
    }

    let passwordHash = await bcrypt.hash(req.body.password, saltRounds);

    context.log(passwordHash);

    const newUser = {
        id: uuid4(),
        name: req.body.name,
        email: req.body.email,
        password: passwordHash,
        age: req.body.age
    }

    const usersDataFilePath = 'users.json';

    const data = fs.readFileSync(usersDataFilePath, 'utf-8');
    const usersData = JSON.parse(data);

    for (user of usersData) {
        if (user.email === req.body.email) {
            context.log('User already exists!')
            let response = {
                status: 400,
                body: "Account with this email already exists. Please login with your credentials!"
            };
            context.res.status(400).json(response);
            return;
        }
    }
    // usersData.forEach(user => {
    //     if (user.email === req.body.email) {
    //         context.log('User already exists!')
    //         context.res = {
    //             status: 400,
    //             body: "Account with this email already exists. Please login with your credentials!"
    //         };
    //         return;
    //     }
    // });


    usersData.push(newUser);
    const usersJson = JSON.stringify(usersData);

    fs.writeFileSync(usersDataFilePath, usersJson);

    let response = {
        status: 200,
        body: "User has been added!"
    };
    context.res.status(200).json(response);

}