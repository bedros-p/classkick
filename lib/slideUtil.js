const axios = require("axios");
const {log,enableLogs} = require("./logging")

//anonymousstudent->assignment_id = AYRvtxKTR6W9AXbzawba9w, roster_id->AYRvt1wFReex4jpVAk2ihw
//works = POST https://services.classkick.com/v1/assignment-works {assignment_id: "AYRvtxKTR6W9AXbzawba9w", roster_id: "AYRvt1wFReex4jpVAk2ihw"} -> id:AYRvt9UbSfWKUp1c98j0LQ
//https://services.classkick.com/v1/assignment-works/AYRvt9UbSfWKUp1c98j0LQ/assignment -> question_work = (questions[slidenum-1 (=0)]->id = AYRvtxKTS-6IUyKvSkS9Nw
//works["question_works"][question_work][element_list_id] 

let api = "https://services.classkick.com/v1/"
//there HAS to be a better way to do this, but for now this is how it is
//i CAN get the list of usernames and log in as one, but that feels wrong
//

/**
 * Extract info about assignment
 * @param {String} classcode 
 * @param {String} hookname="classkickAPI-hook" - To get the assignment info, the info extract method needs credentials. It'll get these credentials through any user account, new or existent
 */
async function infoExtract(classcode,hookname="classkickAPI-hook", staging=false){
    let anon = {"class_code":classcode,"name":hookname}
    let k = await axios.post(`${api}users/login/anonymous-student`,anon, { validateStatus: false }).then(data=>data.data)
    if (k.status == 404){
        return console.warn("CLASSKICK API | INVALID CLASS CODE!")
    }
    
    log("Student Access Token Received.")
    let token = k.token
    let info = k.class_code

    let globalId = info.assignment_id

    let works = await axios.post(`${api}assignment-works`, {assignment_id: globalId, roster_id: info.roster_id},{headers:{
        "Authorization":`Bearer ${token}`
    }}).then(data=>data.data)

    let localAssignment = works.id

    let localAssignmentData = await axios.get(`${api}assignment-works/${localAssignment}/assignment`,{headers:{
        "Authorization":`Bearer ${token}`
    }}).then(data=>data.data)

    let localAssignmentMap = {}
    let globalAssignmentMap = {}
    let elementShardsLocal = {}
    let elementShardsGlobal = {}
    Object.keys(works["question_works"]).forEach((q,index)=>{
        let id = localAssignmentData["questions"][index].id                          //from observations, do not change
        localAssignmentMap[index+1] = works["question_works"][id]["element_list_id"] //from observations, do not change
        globalAssignmentMap[index+1] = id
        elementShardsLocal[localAssignmentMap[index+1]] = works["question_works"][id]["element_list_db"] //from observations, do not change
        elementShardsGlobal[id] =  localAssignmentData["questions"][index]["element_list_db"] //basically id but instead of [index].id its .element_list_db
    })

    let endResult = {
        globalAssignment : {
            id : globalId,
            roster:info.roster_id // i understand nesting this deep is bad but it is needed for developers to see what it contains
        },
        assignment:{
            id : localAssignment
        }, //assignmentWorks
        user:{
            "token":token,
            "id":works.owner_id
        },
        globalSlideMap:globalAssignmentMap, //assignmentWorks 
        slideMap:localAssignmentMap,
        elementShardsLocal:elementShardsLocal,
        elementShardsGlobal:elementShardsGlobal
    }

    return endResult
}
module.exports = {infoExtract}