const { get,set,child, push, getDatabase, ref} = require("firebase/database");
const {shardConnection} = require("./shardManager") //shardConnection(25) loads shard-25

const {infoExtract} = require("./slideUtil")


// Initialize Firebase


const Elements = require("./elements")

class anonymousStudent{ //Creating a student will load assignment data
    /**
     * Classkick Student Class allowing accessing an assignment as a student
     * @param {String} code
     * @param {String} username
     * @description
     * For it to actually create, you need to initialize it then call anonymousStudent.create()
     */
    constructor(code, username){
        [this.code,this.username] = [code,username]
        //this.info = null
        //this.token = null

        this.elementsMade = {

        }

    }

    


    /**
     * 
     * @param {String} slideId 
     * @returns {shardConnection}
     */
    localdbRef(slideId){
        return this.localConnMap[slideId]
    }

    /**
     * Fully creates the student object
     * @returns {ClasskickStudent}
     */
    async create(){
        //await ready
        let info = (await infoExtract(this.code,this.username))
        this.localConnMap = {}
        let localSlideIds = info.elementShardsLocal
        let globalSlideIds = info.elementShardsGlobal
        /**
         * Connection Map for shards from global assignment
         * @type {Object.<string, shardConnection>}
         */
        this.globalConnMap = {}


        Object.keys(localSlideIds).forEach(async (slideId, index)=>{
            let globalSlide = Object.keys(globalSlideIds)[index]
            this.localConnMap[slideId] = new shardConnection(localSlideIds[slideId]) //there'll be the same amount of slides for every user, so we'll just use the same loop
            this.globalConnMap[globalSlide] = new shardConnection(globalSlideIds[globalSlide])
        })
        this.info = info
    }
    /**
     * Reload assignment data, useful in cases where the assignment gets updated (Not automatic yet)
     * @returns {ClasskickStudent}
     */
    async refresh() {
        let info = (await infoExtract(this.code,this.username))
        this.assignment = info.assignment
        this.info = info
        return this
    }
    /**
     * Append an element to the student assignment
     * @param {Number} slideNumber - The slide number to append it to
     * @param {Elements.Textbox} element - The element to create
     * @returns {String} Returns the element ID of the element created
     */
    async createElement(slideNumber,element){
        let slideID = this.info.slideMap[slideNumber]
        let json = element.json
        let shardReference = ref(this.localConnMap[slideID].database)
        await this.localConnMap[slideID].ready
        element.slideShards = this.localConnMap
        json.metadata.owner_id = `${this.info.user.id}`
        let reference = push(child(shardReference,`/element_lists/${slideID}/elements`),json)
                            .then((keyRetriever)=>{
                                return keyRetriever.key //Indented for readability
                            })

        reference = await reference // I can await it in the same line as the definition but with this it's more readable
        
        element.slides[slideID] ??= []
        element.slides[slideID].push(reference)  

        return reference.key
    }
    /**
     * Updates the data of a student element in a given slide
     * @param {Number} slide - The slide number the element is in (starts from 1)
     * @param {String} elementId - The element ID to modify
     * @param {Object} newData - The data to append
     */
    async updateData(slide,elementId,newData){  
        let slideID = this.info.slideMap[slide]
        let shardReference = this.globalConnMap[slideID].dbReference
        await this.globalConnMap[slideID].ready
        set(child(shardReference,`/element_lists/${slideID}/elements/${elementId}`),newData)
    }
    /**
     * Get all user-created elements in a slide
     * @param {Number} slideNumber 
     */
    async getElementsInWork(slideNumber){
        let slideID = this.info.slideMap[slideNumber]
        
        let shardReference = this.localConnMap[slideID].dbReference
        await this.localConnMap[slideID].ready
        
        let result = await (get(child(shardReference,`/element_lists/${slideID}/elements/`)).then(snapshot=>{
            return snapshot.val()
        }))
        return result
    }
    
    /**
     * Get all teacher-created elements in a slide
     * @param {Number} slideNumber 
     */
    async getElementsInAssignment(slideNumber){
        let slideID = this.info.globalSlideMap[slideNumber]
        let shardReference = this.globalConnMap[slideID].dbReference
        await this.globalConnMap[slideID].ready

        let result = await (get(child(shardReference,`/element_lists/${slideID}/elements/`)).then(snapshot=>{
            return snapshot.val()
        }))
        return result
    }
}

module.exports = {
    anonymousStudent
}