export function setHooks(){
    //////////////////////////////////////////
    //      Init Hooks start here           //
    //////////////////////////////////////////


    //attempt to reapply textures
    let reloadAttempts = 0;
    let mysi = setInterval(
    function(){
        if(reloadAttempts < 20){
            let placeables = game.canvas.templates?.placeables;
            try{
                if(placeables){
                    clearInterval(mysi);
                    console.debug("SIFT | Applying textures post-reload")
                    for(let i = 0; i < placeables.length; i++){
                        if(placeables[i].data.flags.siftoolkit != undefined){
                            SIFT.textures.reapplyTexture(placeables[i]);		
                        }
                    }
                }else{
                    console.debug("SIFT | Placeables not ready");
                }
            }catch (e){}
        }
    },300);


    async function newHover(wrapped, ...args) {
        return true;
    }
    libWrapper.register("siftoolkit", "CONFIG.MeasuredTemplate.objectClass.prototype._canHover", newHover,'OVERRIDE');
    
    Hooks.on('ready', () => {
        try{window.Ardittristan.ColorSetting.tester} catch {
            ui.notifications.notify('Please make sure you have the "lib - ColorSettings" module installed and enabled.', "error");
        }
    });



    Hooks.on('updateWorldTime', (...args) => {
        if(SIFT.Settings.timeProcessor == "SimpleCalendar"){
            SIFT.utils.ageTemplates(args[1]);
        }
        if(game.combats.active == undefined){
            SIFT.utils.cleanupTemplates();
        }
    });
        
    Hooks.on("deleteMeasuredTemplate",e=>{SIFT.currentTT?.remove();});

    Hooks.on("hoverMeasuredTemplate",e=>{
        let sourceTemplate = SIFT.utils.getSourceTemplate(e.data._id);
        let placeable = SIFT.utils.getPlaceableTemplate(e.data._id);
        let mx = e.x;
        let my = e.y;
        mx += 30;
        my -= 30;
        let ttplayer = game.actors.get(sourceTemplate.data.flags.siftoolkit?.actor)?.name??(game.users.get(sourceTemplate.data.user)?.name??"Unknown");
        let ttspell = sourceTemplate.data.flags.siftoolkit?.sif??"???"
        let ttduration = "";
        
        ttduration = '<span style="font-weight:500;">Remaining: </span>' + ((sourceTemplate.data.flags.siftoolkit?.duration)??"Unknown") + " seconds";
        
        let scale = document.getElementById("hud").style.transform.substring(6,document.getElementById("hud").style.transform.length-1);
        if(e._hover){
            if(SIFT.currentTT == undefined){
                SIFT.currentTT = document.createElement("DIV");
            }
            SIFT.currentTT.innerHTML = '<table style="border:0px;padding:0px;margin:0px;border-collapse: collapse;"><tr style="font-weight:bold;font-size:115%"><td>'+ttplayer+'</td></tr><tr style="font-weight:500"><td>'+ttspell+'</td></tr><tr><td>'+ttduration+'</</td></tr></table>';
            SIFT.currentTT.setAttribute("id", "spell-template-manager-tooltip");
            SIFT.currentTT.style.position = "absolute";
            SIFT.currentTT.style.borderColor = "black";
            SIFT.currentTT.style.borderWidth = "2px";
            SIFT.currentTT.style.borderStyle = "solid";
            SIFT.currentTT.style.backgroundColor = "white";
            SIFT.currentTT.style.borderRadius = "5px";
            SIFT.currentTT.style.padding = "5px";
            SIFT.currentTT.style.left = (mx+"px");
            SIFT.currentTT.style.visibility = "visible";
            SIFT.currentTT.style.left = (placeable.worldTransform.tx+(placeable.controlIcon.width*scale/2)+10+"px");
            SIFT.currentTT.style.top = (placeable.worldTransform.ty-(placeable.controlIcon.width*scale/2)+"px");
            document.body.appendChild(SIFT.currentTT);
            
        }else{
            SIFT.currentTT?.remove();
        }
    });
    


    Hooks.on("updateMeasuredTemplate",async (e)=> {
        console.debug("SIFT | updating template",e);
        if(e.data.flags.siftoolkit?.displayData?.useTexture){
            let placeable = SIFT.utils.getPlaceableTemplate(e.id);
            SIFT.textures.reapplyTexture(placeable);		
        }
    });

    Hooks.on("createMeasuredTemplate", (...args) => {
        let template = args[0];
        let userId = args[2];
        let SIFData = game.user.getFlag("siftoolkit","chatData")[game.user.getFlag("siftoolkit","chatData").length-1].SIFData;

        if(game.userId == userId){
            SIFT.utils.updateTemplate(template);
            if(SIFData?.displayData?.useTexture && (SIFData?.displayData?.spellTexture != "")){
                let attempts = 0;
                let mysi = setInterval(
                function(){
                    if(attempts < 20){
                        attempts++;
                        SIFT.textures.applyTexture(args,mysi);                            
                    }else{
                        clearInterval(mysi);
                    }
                });
            }
        }
        //todo: check item to determine if to play
        if(SIFData.audioData?.playTemplateAudio && SIFData.audioData?.clip != ""){
            SIFT.utils.playAudio(template);
        }

        SIFT.utils.clearTemplateData();
    });
    
}
