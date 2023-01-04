/** 
 * Classkick Student API, with Firebase functions.
 * 
 * @projectname Classkick Student API
 * @version 0.1
 * @author Bedros Pamboukian - SemiconductorShortage
 */

const Elements = require("./lib/elements.js")

const {enableLogs} = require("./lib/logging")
const {anonymousStudent} = require("./lib/anonStudent")

//174905604722-dfu3ki6es9ufi9fvhsqj5juhificuds9.apps.googleusercontent.com
//gauth, maybe will add
// See: https://firebase.google.com/docs/build 
// Realtime Database->Web is what this API mainly uses
//This is public information, do not worry




//--ASSIGNMENT-WORKS--
//slide 1 end b5Tw -> 2) element_list_id
//slide 2 end RaCw -> 1) element_list_id 
//slide 3 end B2NQ -> 3) element_list_id
//slide 4 end YhNw -> 5) element_list_id
//slide 5 end OXsA -> 6) element_list_id
//slide 6 end 96iQ -> 4) element_list_id
//slide 7 end UXCg -> 7) element_list_id
//slide 8 end stIQ -> 8) element_list_id


module.exports = {
    enableLogs,
    anonymousStudent,
    Elements
}