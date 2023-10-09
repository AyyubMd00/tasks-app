const emailValidator = require("email-validator");
const passwordValidator = require('password-validator');

module.exports = async function (context, req) {
    if (!req.body) {
        responses.sendBadRequest(
            "Request body is missing!", context
        );
        return;
    }
    
    if (!req.body.email) {
        responses.sendBadRequest(
            "Email is missing!", context
        );
        return;
    }
    if (!req.body.password) {
        responses.sendBadRequest(
            "Password is missing!", context
        );
        return;
    }
    // if (!req.body.confirmPassword) {
    //     responses.sendBadRequest(
    //         "Confirm Password is missing!", context
    //     );
    //     return;
    // }
    if (!req.body.name || !req.body.name.length) {
        responses.sendBadRequest(
            "Name is missing!", context
        );
        return;
    }
    if (!req.body.age) {
        responses.sendBadRequest(
            "Age is missing!", context
        );
        return;
    }

    const isEmailValid = emailValidator.validate(req.body.email)
    if (!isEmailValid) {
        responses.sendBadRequest(
            "Invalid Email!", context
        );
    }

    const schema = new passwordValidator();
    schema
    .is().min(8)
    .is().max(100)
    .has().uppercase()
    .has().lowercase()
    .has().digits(2)     
    const isPasswordValid = schema.validate(req.body.password);
    if (!isPasswordValid) {
        responses.sendBadRequest(
            "Invalid password!", context
        );
    }
    // if (req.body.password !== req.body.confirmPassword) {
    //     responses.sendBadRequest(
    //         "Password must be same as confirm password!", context
    //     );
    // }

    if (req.body.age < 10) {
        responses.sendBadRequest(
            "Age must be greater than or equal to 10!", context
        );
    }

    context.log.error('JavaScript HTTP trigger function processed a request.');
    context.log('warning');
    const name = (req.query.name || (req.body && req.body.name));
    const responseMessage = name
        ? "Hello, " + name + ". This HTTP triggered function executed successfully."
        : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };
}