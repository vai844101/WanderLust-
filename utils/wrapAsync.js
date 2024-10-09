//Custom Error 
//This is a custom error class that will be used to throw errors if any of the required fields

//are not present in the request body.

module.exports = (fn) => {
    return function(req, res, next) {
        fn(req, res, next).catch(next);
    }
}