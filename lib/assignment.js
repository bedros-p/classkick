import axios from 'axios'

class Assignment{
    constructor(classCode=null){

    }
    from(assignmentId=null,classCode=null,rosterId=null,token=null) {
        this.assignmentId = assignmentId
        this.classCode = classCode
        this.rosterId = rosterId
        if (classCode??token == null){

        }
    }
}