const { ref, set } = require("@firebase/database")
const { shardConnection } = require("./shardManager")
const {log} = require("./logging")
/**
 * Basic Element Class to extend :thumbs:
 * @param {String} [role]="student"
 * @param {String} [intent]="work"
 * @param {String} [owner_id]=""
 */
class Element {
    role = "student"
    intent = "work"
    owner_id = ""
}
//intents are work and content, and help i think
class Textbox extends Element {
    json = {
        "data": {
            "backgroundColor": null,
            "borderColor": null,
            "center": null,
            "colors": null,
            "fontSize": null,
            "size": null,
            "text": null,
            "type": null
        },
        "metadata": {
            "intent": null,
            "owner_id": null,
            "role": null
        } //just to stop getters and setters from freaking out
    }
    /**
     * Create a Textbox
     * @param {String} content - Required - The text the textbox will contain
     * @param {Array} position - Required - the center of the textbox on the assignment sheet
     * @param {Number} position[].x - The X Position of the center for the box
     * @param {Number} position[].y - The Y Position of the center for the box
     * @description <b>Screen Positions</b>: <br />- bottom right-> 1004 2008 <br />- top right-> 1004 0 <br />- bottom left-> 0 2008 <br />- top left -> 0 0 <br /> <br /> Note : For the optional parameters, you'll have to put it in an object, like so: new Textbox("Hello!", [300,300], {optionParam:value}). This applies to all elements with optional params.
     * 
     * @param {String} [role]="student"
     * @param {String} [intent]="work"
     * @param {String} [owner_id]=""
     * @param {Number} [fontsize] - The font size in pixels, remember that the assignment size is 1004x2008
     * @param {String} [color]="#404041" - Text color, hex or [{"start":0,"color":"#"},{}...] as a string - Alpha: Unknown
     * @param {String} [backgroundCol]="#00000000" - Background color in hexadecimal, Alpha: Supported
     * @param {String} [borderCol]="#00000000"- Border color in hexadecimal, Alpha: Supported
     * @param {Array} [size]=[360,null] - a list in the format [x,y] to scale the textbox as needed, keep y as null for auto calculation
     * @param {Number} size[].x - The width of the textbox
     * @param {Number} [size[].y] - The height of the textbox
     * @returns {Textbox}
     */
    constructor(
        content, position, 
        {fontsize=25, color="#404041", backgroundCol="#00000000",borderCol="#00000000",size=[360,null],intent="work",role="student",owner_id=""}={}
        ){
        super() //allow access to Element
        this.original = content
        this.text = content
        this.content = content
        
        let calculatedY = (                                       //content.length isnt ideal for this, i have to pick the longest line using Math.max, but it should be decent for a rough approximation for one line textboxes 
                (content.split("\n").length)+(Math.ceil((fontsize*content.length)/size[0])) 
                //Its not perfect, considering the font in classkick isnt monospace (!) 
                //i'd have to do some magic for that, and this API isnt for wizards (sorry)
            )*fontsize
        
        let colorString = `[{"start":0,"color":"${color}"}]`
        let creationJSON = {
            "data": {
                "backgroundColor": backgroundCol,
                "borderColor": borderCol,
                "center": JSON.stringify([Math.ceil(position[0]),Math.ceil(position[1])]),
                "colors": color.startsWith("#") ? colorString: color,
                "fontSize": fontsize,
                "size": `[${Math.round(size[0])},${size[1] == null?calculatedY:size[1]}]`,
                "text": this.text,
                "type": "textbox"
            },
            "metadata": {
                "intent": intent,
                "owner_id": owner_id,
                "role": role
            }
        }

        this.json = creationJSON
        this.position = position
        /**
         * link slides to shards
         * @type {Object.<string,shardConnection>}
         */
        this.slideShards = {}

        
        /**
         * all the (local) slide ids this text appears in, as a key value pair of slide:[id]
         * local because a student shouldn't be able to create it globally
         * @type {Object.<string,Array.<string>}
         */
        this.slides = {}

        //add support for content setter to 
        //iterate through all slides its in
              //iterate through the ids it exists in
                    //update value in the shard it belongs in, using the id it exists as
    }

    modifyContent(target, value){
        this.json.data[target]=value

        let keys = Object.keys(this.slides)
            
        keys.forEach((slideId)=>{
            let linkedElements = this.slides[slideId]
            linkedElements.forEach((elementId)=>{
                let db = this.slideShards[slideId].database
                let elementRef = ref(db,`/element_lists/${slideId}/elements/${elementId}/data/${target}`) //avoid replacing entire json, that way if i move it in classkick, it should keep that position and only modify the content when i set the new content
                set(elementRef, value)
            })
        })
    }

    /**
     * @param {String} value
     */
    set content (value){
        if ((this.original!=value) && (this.content != value)){
            this.modifyContent("text",value)
            log("All Textboxes Modified Successfully!")
        }
    }
    
    get content (){
        return this.json.data["text"] //should probably make this also fetch the content from the first id it finds for live update
    }
     
}

class Drawing {
    /**
     * WIP! DO NOT USE!!
     * @param {Array<Array>} points
     * @param {String} [color]="#404041" - Drawing Color
     * @param {Number} [width]=3 - 
     * @param {String} [role]="student"
     * @param {String} [intent]="work"
     * @param {String} [owner_id]=""
     * @returns {Drawing}
     */
    constructor(
        points,
        color="#404041",
        width=3,
        {role="student", intent="work", owner_id=""},
        ){
        this.text = text
        
        let creationJSON = {
            "data": {
                "color": color,
                "points": points,
                "type": "line",
                "width":width
            },
            "metadata": {
                "intent": intent,
                "owner_id": owner_id,
                "role": role
            }
        }
    }

}

class Line {
    /**
     * WIP! DO NOT USE!!
     */
    constructor(){
        console.warn("Line is not added yet! Please be patient, as 1.0 has only been")
    }
}

class Sticker {

}

class Link {

}

class Image {
    /*
    {
        "data": {
            "center": "[x,y]",
            "image_url": "https://.../",
            "size": "[x,y]",
            "transform": "{\"scale\":1,\"rotation\":0}",
            "type": "image"
        },
        "metadata": {
            "intent": "work",
            "owner_id": "xyz",
            "role": "student"
        }
    }
    */

}

module.exports = {
    Textbox,Drawing,Line,Image,Link,Sticker
}