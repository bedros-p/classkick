const { getDatabase, ref} = require("firebase/database");
const {initializeApp} = require("firebase/app")
const {signInAnonymously, getAuth} = require("firebase/auth")
const {log} = require("./logging")
/**
 * Creates and handles connections to shards by either routing to existing connections or by creating new ones
 */
class shardConnection{
    firebaseConfig = { //from https://services.classkick.com/v1/info
        apiKey: "AIzaSyDUpUYCrLkkBrgcXuw-lNdhwUYpHW-t6JU",
        authDomain: "blistering-fire-2580.firebaseapp.com",
        databaseURL: "https://shardId.firebaseio.com",
        projectId: "blistering-fire-2580"
    }
    /**
     * Creates and handles connections to shards by either routing to existing connections or by creating new ones
     * @param {String} shardId - Shard name, like "blistering-fire-2580-shard-04"
     */
    constructor(shardId){
        
        if (shardToConnMap[shardId] !== undefined){
            let existing = shardToConnMap[shardId]
            Object.assign(this,existing)
            log(`[Shard Manager] : Shard Number ${shardId.split("-").slice(-1)} found in map, using existing Shard connection instead.`);
        }
        else {
            this.firebaseConfig["databaseURL"] = this.firebaseConfig["databaseURL"].replace("shardId",shardId)
            this.app = initializeApp(this.firebaseConfig);
            this.database = getDatabase(this.app)
            this.dbReference = ref(this.database)
            this.authService = getAuth(this.app);
            
            this.ready = signInAnonymously(this.authService).then(async (cred)=>{
                log(`[Shard Manager] : Shard Number ${shardId.split("-").slice(-1)} initialized.`);
            })
        }
        
        shardToConnMap[shardId] = {app:this.app,database:this.database,dbReference:this.dbReference,authService:this.authService,ready:this.ready}
    }
    
}

let shardToConnMap = {

}

module.exports = {shardConnection}