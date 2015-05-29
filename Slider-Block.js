/**
 * By:      Anders “Phratzz” Larsen
 * Contact: anders.larsen5777@gmail.com
 * Roll20:  https://app.roll20.net/users/220952
 * 
 * This script  is made for performing sliding puzzles or stuff with the same mechanics.
 * See "Link" for an example
 * 
 * This script finds the first item with the name specified in "Target", you can assign names to a token by opening it's properties
 * afterwards it moves the token in your specified direction "Up", "Down", "Left" or "Right" (case insensitive) by the length of
 * the token in the direction you wanna move it.
 * Example: your target is 3 grid spaces wide and 2 spaces high, "!Sliding_Block down" will move it 2 spaces down
 * 
 * Afterwards the script will check if it needs to move anything with it or move anything back (depending on "move_with" and "move_back")
 * it will then check which layers it's allowed to move items on, default is all layers but you can modify that yourself.
 * When it's done checking it will move the item it needs to to the same position relative to the target token as they were before.
 * 
 * The variable "gm_function" can be set to false if you want all your players to have access to this command
 * 
 * If you have any questions about this script, feel free to contact me via mail.
 */
on("chat:message", function(msg) {
    var command = "!Sliding_Block"; //Command name
    var sender = "Dungeon Bot";     //Any text send back is with this name
    var target = "target";          //Sliding block

    var gm_function = true;         //if the function is GM only
    
    var move_with = true;           //move all items on the target with when moving
    var move_back = true;           //move all items on the targets destination to the targets original position (swapping if both are true)
    
    var move_layer_map = true;      //move items from the map layer
    var move_layer_objects = true;  //move items from the objects layer
    var move_layer_gm = true;       //move items from the gm layer
    var move_layer_walls = true;    //move items from the walls layer
    
    command = command.toLowerCase();
    if(msg.type == "api" && msg.content.toLowerCase().indexOf(command) !== -1 && (playerIsGM(msg.playerid) == true || playerIsGM(msg.playerid) == gm_function)) {
        var args = msg.content.toLowerCase().replace(command, "").split(" ");
        
        var direction = args[1];
        
        var legal_directions = ["up", "down", "left", "right"];
        if(legal_directions.indexOf(direction) !== -1) {
            switch(direction) {
                case "up"   : var direction_attr = "top";  var direction_length = "height"; direction_mod = -1; break;
                case "down" : var direction_attr = "top";  var direction_length = "height"; direction_mod = 1;  break;
                case "left" : var direction_attr = "left"; var direction_length = "width";  direction_mod = -1; break;
                case "right": var direction_attr = "left"; var direction_length = "width";  direction_mod = 1;  break;
            }
            
            var objects = findObjs({
                _pageid: Campaign().get("playerpageid"),
                name: target,
            });
            
            if(objects.length === 0) {
                sendChat(sender, "/w gm <br>Command: '<i>" + command + "</i>'<br>Could'nt find target: '<i>" + target + "</i>'");
            } else {
                var master = objects[0];
                
                if(move_with) {
                    var movewith = filterObjs(function(obj) {
                        if( obj.get("__pageid") == Campaign().get("playerpageid") &&
                            obj.get("name") !== target &&
                            obj.get("left") < (master.get("left") + (master.get("width") / 2)) &&
                            obj.get("left") > (master.get("left") - (master.get("width") / 2)) &&
                            obj.get("top") < (master.get("top") + (master.get("height") / 2)) &&
                            obj.get("top") > (master.get("top") - (master.get("height") / 2)) &&
                            (   (obj.get("layer") == "map" && move_layer_map) ||
                                (obj.get("layer") == "objects" && move_layer_objects) ||
                                (obj.get("layer") == "gmlayer" && move_layer_gm) ||
                                (obj.get("layer") == "walls" && move_layer_walls)
                            )
                        ) {
                            return true;
                        } else {
                            return false;
                        }
                    });
                }
                
                master.set(direction_attr, master.get(direction_attr) +  direction_mod * (master.get(direction_length)));
                
                if(move_back) {
                    var moveback = filterObjs(function(obj) {
                        if( obj.get("__pageid") == Campaign().get("playerpageid") &&
                            obj.get("name") !== target &&
                            obj.get("left") < (master.get("left") + (master.get("width") / 2)) &&
                            obj.get("left") > (master.get("left") - (master.get("width") / 2)) &&
                            obj.get("top") < (master.get("top") + (master.get("height") / 2)) &&
                            obj.get("top") > (master.get("top") - (master.get("height") / 2)) &&
                            (   (obj.get("layer") == "map" && move_layer_map) ||
                                (obj.get("layer") == "objects" && move_layer_objects) ||
                                (obj.get("layer") == "gmlayer" && move_layer_gm) ||
                                (obj.get("layer") == "walls" && move_layer_walls)
                            )
                        ) {
                            return true;
                        } else {
                            return false;
                        }
                    });
                    for (i = 0; i < moveback.length; i++) {
                        var slave = moveback[i];
                        slave.set(direction_attr, slave.get(direction_attr) -  direction_mod * (master.get(direction_length)));
                    }
                }
                
                if(move_with) {
                    for (i = 0; i < movewith.length; i++) {
                        var slave = movewith[i];
                        slave.set(direction_attr, slave.get(direction_attr) +  direction_mod * (master.get(direction_length)));
                    }
                }
            }
        } else {
            sendChat(sender, "/w " + msg.who + " <br>Illigal direction: '<i>" + direction + "</i>'");
        }
    }
});