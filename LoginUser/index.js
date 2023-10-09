const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

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

    const usersDataFilePath = 'users.json';

    const data = fs.readFileSync(usersDataFilePath, 'utf-8');
    const usersData = JSON.parse(data);

    let user = usersData.find(({ email }) => email == req.body.email) //here, email is taken from the element from usersData using spread operator.
    if (!user || !await bcrypt.compare(req.body.password, user.password)) {
        let response = {
            status: 403,
            body: "Incorrect email or password!"
        };
        context.res.status(403).json(response);
        return;
    }
    
    currentUser = {
        id: user.id,
        email: user.email,
        password: user.password
    };

    const token = jwt.sign(currentUser, process.env["JWTSecretKey"], {
        expiresIn: '24h'
    });
    let response = {
        status: 200,
        body: {
            message: "Login successful!",
            token: token
        }
    };
    context.res.status(200).json(response);
    return;

    // for (user of usersData) {
    //     if (user.email === req.body.email) {
    //         if (await bcrypt.compare(req.body.password, user.password)) {
    //             user = {
    //                 id: user.id,
    //                 email: user.email,
    //                 password: user.password
    //             };
    //             const token = jwt.sign(user, process.env["JWTSecretKey"], {
    //                 expiresIn: '24h'
    //             });
    //             let response = {
    //                 status: 200,
    //                 body: {
    //                     message: "Login successful!",
    //                     token: token
    //                 }
    //             };
    //             context.res.status(200).json(response);
    //             return;
    //         }
    //         else {
    //             let response = {
    //                 status: 403,
    //                 body: "Incorrect email or password!"
    //             };
    //             context.res.status(403).json(response);
    //             return;
    //         }
    //     }
    // }

    // let response = {
    //     status: 403,
    //     body: "Incorrect email or password!"
    // };
    // context.res.status(403).json(response);
}