let logging = false
function log(message){
    if (logging == true){
        console.log("\x1b[32mCLASSKICK API LOGGING \x1b[0m |", message)
    }
}

function enableLogs(bool){
    logging=bool
}

module.exports = {enableLogs,log}