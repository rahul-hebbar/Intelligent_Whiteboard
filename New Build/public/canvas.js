// Window Dimensions
var width = window.innerWidth*0.99;
var height = window.innerHeight/1.32;

// ID flags
var lineID = 1;
var textID = 1;
var groupID = 1;
var shapeID = 1;

// Flags
var isPaint = false;
var isTextArea = false;
var shapesel = null;
var url = null;
var kon_image;

// Objects
var lastLine;
var textNode;
var imgURL;
var groupNode;
var shapegp;
var rectNode;
var ovalNode;
var rhombNode;
var paraNode;
var arrowNode;

// Toolbar mode flag
var mode = 0;

// Style Flags
var stroke_width = 5;
var stroke_color = '#ff0000';
var font_size = 20;
var font_color = '#000000';

// Functionality Flags
let currentShape;
let currentText;

// DOM functionality
var menuNode = document.getElementById("menu");
var strokewidthNode = document.getElementById("stroke_width");
var strokecolorNode = document.getElementById("stroke_color");
var fontsizeNode = document.getElementById("font_size");
var fontcolorNode = document.getElementById("font_color");

// Socket
var socket = io();
var reader = new FileReader();

// Stage
var stage = new Konva.Stage({
    container: 'canvas',
    width: width,
    height: height,
})
stage.getContainer().style.border = '1px solid black';

// Layer creations and adding to stage
var layer = new Konva.Layer();
stage.add(layer)
var stageRect =  new Konva.Rect({ 
    x:0,
    y:0,
    width: width,
    height: height,
    fill: '#ffffff',
    id: 'stage-fill'
})
layer.add(stageRect);
layer.draw();

// Handle Stage Event
stage.on('mousedown touchstart', function (e) {
    if (mode === 1){
        stroke_width = strokewidthNode.value;
        stroke_color = strokecolorNode.value;
        isPaint = true;
        var pos = stage.getPointerPosition();
        lastLine = new Konva.Line({
            stroke: stroke_color,
            strokeWidth: stroke_width,
            globalCompositeOperation: 'source-over',
            points: [pos.x, pos.y],
            draggable: true,
            id: `line-${lineID}`
        });
        lineID = lineID+1;
        layer.add(lastLine);
    }
    else if (mode === 2){
        mode = 0;
        font_size = fontsizeNode.value;
        font_color = fontcolorNode.value;
        textNode = new Konva.Text({
            text: 'Edit Text',
            x: 50,
            y: 80,
            fontSize: font_size,
            draggable: true,
            width: 200,
            fill: font_color,
            id: `text-${textID}`
        });
        textID = textID + 1;
        layer.add(textNode);
        layer.draw();
        //socket
        socket.emit('sendupdate',{ type:'Text', id: textID, params: ['Edit Text',50,80,font_size,font_color,200,textNode.id()]});
    }
    else if (mode === 3){
        // var pos_end = stage.getPointerPosition();
        var shapetr = new Konva.Transformer({
            rotateEnabled: false,
            borderEnabled: false,
            anchorSize:5,
        })
        shapegp = new Konva.Group({
            x: 50,//pts[0],
            y: 80,//pts[1],
            id: `group-${groupID}`,
            draggable: true,
        })
        if (shapesel === 'rect'){
            rectNode = new Konva.Rect({
                x: 50,//pts[0],
                y: 80,//pts[1],
                width: 100,//Math.abs(pos_end.x-pts[0]),
                height: 50,//Math.abs(pos_end.y-pts[1]),
                fill: '#ed6f07',
                draggable: false,
                id: `shape-${groupID}`,
                stroke: 'black',
                strokeWidth: 2,
            })
            groupID = groupID+1;
            shapetr.nodes([rectNode]);
            shapegp.add(rectNode);
            shapegp.add(shapetr);
            layer.add(shapegp);
            socket.emit('sendupdate', {type:'Rect', id: groupID,params:[50,80,100,50,rectNode.id()]});
            rectNode.on('transformend', (e) =>{
                var par = e.target.attrs;
                socket.emit('sendupdate',{type: "Transform", params:[par.id,par.x,par.y,par.scaleX,par.scaleY]});
            });
        }
        else if (shapesel === 'oval'){
            ovalNode = new Konva.Ellipse({
                x: 100,//(pts[0]+pos_end.x)/2,
                y: 100,//(pts[1]+pos_end.y)/2,
                radiusX: 50,//Math.floor(Math.abs(pos_end.x-pts[0])/2),
                radiusY: 25,//Math.floor(Math.abs(pos_end.y-pts[1])/2),
                fill: "#0aae25",
                draggable: false,
                id: `shape-${groupID}`,
                stroke: 'black',
                strokeWidth: 2,
            })
            groupID = groupID+1;
            shapetr.nodes([ovalNode]);
            shapegp.add(ovalNode);
            shapegp.add(shapetr);
            layer.add(shapegp);
            socket.emit('sendupdate', {type:'Oval', id: groupID,params:[100,100,50,25,ovalNode.id()]});
            ovalNode.on('transformend', (e) =>{
                var par = e.target.attrs;
                socket.emit('sendupdate',{type: "Transform", params:[par.id,par.x,par.y,par.scaleX,par.scaleY]});
            });
        }
        else if (shapesel === 'rhombus'){
            rhombNode = new Konva.Rect({
                x: 50,//pts[0],
                y: 80,//pts[1],
                width: 80,//Math.floor(Math.abs(pos_end.x-pts[0])/1.5),
                height: 80,//Math.floor(Math.abs(pos_end.x-pts[0])/1.5),
                rotation: 45,
                fill: '#ff0000',
                draggable: false,
                id: `shape-${groupID}`,
                stroke: 'black',
                strokeWidth: 2,
            })
            groupID = groupID+1;
            shapetr.nodes([rhombNode]);
            shapegp.add(rhombNode);
            shapegp.add(shapetr);
            layer.add(shapegp);
            socket.emit('sendupdate', {type:'Rhomb', id: groupID, params:[50,80,80,rhombNode.id()]});
            rhombNode.on('transformend', (e) =>{
                var par = e.target.attrs;
                socket.emit('sendupdate',{type: "Transform", params:[par.id,par.x,par.y,par.scaleX,par.scaleY]});
            });
        }
        else if (shapesel === 'paragm'){
            paraNode = new Konva.Line({
                x: 50,
                y: 80,
                points: [70,80,170,80,150,140,50,140],
                fill: '#00D2FF',
                stroke: 'black',
                strokeWidth: 2,
                closed: true,
                draggable: false,
                id: `shape-${groupID}`,
            })
            groupID = groupID+1;
            shapetr.nodes([paraNode]);
            shapegp.add(paraNode);
            shapegp.add(shapetr);
            layer.add(shapegp);
            socket.emit('sendupdate', {type:'Para', id: groupID, params:[50,80,paraNode.points(),paraNode.id()]});
            paraNode.on('transformend', (e) =>{
                var par = e.target.attrs;
                socket.emit('sendupdate',{type: "Transform", params:[par.id,par.x,par.y,par.scaleX,par.scaleY]});
            });
        }
        else if (shapesel === 'arrow'){
            arrowNode = new Konva.Arrow({
                x: 50,
                y: 80,
                points: [50,80,50,160],
                fill: 'black',
                stroke: 'black',
                strokeWidth: 2,
                draggable: false,
                id: `shape-${groupID}`,
            });
            groupID = groupID+1;
            shapetr.nodes([arrowNode]);
            shapegp.add(arrowNode);
            shapegp.add(shapetr);
            layer.add(shapegp);
            socket.emit('sendupdate', {type:'Arrow', id: groupID, params:[arrowNode.points(),arrowNode.id()]});
            arrowNode.on('transformend', (e) =>{
                var par = e.target.attrs;
                socket.emit('sendupdate',{type: "Transform", params:[par.id,par.x,par.y,par.scaleX,par.scaleY]});
            });
        }
        layer.batchDraw();
    }
    
})

stage.on('mouseup touchend', (e) => {
    isPaint = false;
    if (mode === 1){
        socket.emit('sendupdate',{ type:'Line', id: lineID,
        params:[lastLine.stroke(),lastLine.strokeWidth(),lastLine.globalCompositeOperation(),lastLine.points(),lastLine.id()]
        });
    }
    else{
        mode = 0;
    }
})

stage.on('mousemove touchmove', function () {
    if (mode === 1){
        if (!isPaint) {
            return;
        }
        const pos = stage.getPointerPosition();
        var newPoints = lastLine.points().concat([pos.x, pos.y]);
        lastLine.points(newPoints);
        layer.batchDraw();
    }
});

stage.on('contextmenu', function (e) {
    e.evt.preventDefault();
    if (e.target.attrs.id === 'stage-fill') {
      return;
    }
    currentShape = e.target;
    menuNode.style.display = 'initial';
    var containerRect = stage.container().getBoundingClientRect();
    menuNode.style.top = containerRect.top + stage.getPointerPosition().y + 4 + 'px';
    menuNode.style.left = containerRect.left + stage.getPointerPosition().x + 4 + 'px';
});

stage.on('dragend', (e) => {
    var mov_x = e.target.attrs.x;
    var mov_y = e.target.attrs.y;
    socket.emit('sendupdate',{type:'drag', params: [e.target.attrs.id,mov_x,mov_y]});
});

stage.on('dblclick', function (e) {
    e.evt.preventDefault();
    if (e.target.className === "Text" && isTextArea === false){
        currentText = e.target
        console.log(currentText);
        var textPosition = currentText.getAbsolutePosition();
        var stageBox = stage.container().getBoundingClientRect();
        var areaPosition = {
            x: stageBox.left + textPosition.x,
            y: stageBox.top + textPosition.y,
        };
        var textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        isTextArea = true;
        fontsizeNode.value = currentText.fontSize();
        fontcolorNode.value = currentText.fill();
        textarea.value = currentText.text();
        textarea.style.position = 'absolute';
        textarea.style.top = areaPosition.y + 'px';
        textarea.style.left = areaPosition.x + 'px';
        textarea.style.width = currentText.width();
        textarea.focus();
        textarea.addEventListener('keydown', function (e) {
            if (e.keyCode === 13) {
                var len = textarea.value.length;
                if (len*font_size >= window.innerWidth){
                    currentText.width(0.9*window.innerWidth);
                }
                else{
                    currentText.width(len*font_size+10);
                }
                font_size = fontsizeNode.value;
                font_color = fontcolorNode.value;
                currentText.fontSize(font_size);
                currentText.fill(font_color);
                currentText.text(textarea.value);
                layer.draw();
                document.body.removeChild(textarea);
                isTextArea = false;
                //socket
                socket.emit('sendupdate',{ type:'updateText',params: [currentText.id(),currentText.text(),font_size,font_color,currentText.width()]});
                fontsizeNode.value = 20;
                fontcolorNode.value = '#000000';
            }
        });
    }
});

document.getElementById('delete-button').addEventListener('click', () => {
    if (currentShape.parent.nodeType === "Group"){
        socket.emit('sendupdate',{ type: 'Delete-GP', params: currentShape.parent.attrs.id});
        currentShape.parent.destroyChildren();
    }
    else{
        socket.emit('sendupdate',{ type: 'Delete', params: currentShape.attrs.id});
        currentShape.destroy();
    }
    layer.draw();
});

window.addEventListener('click', () => {
    menuNode.style.display = 'none';
});

// Handle DOM event
toolbarSelect = (selected) => {
    if (selected < 4){
        mode = selected;
    }
}

drawShape = (selected,shape) => {
    mode = selected;
    shapesel = shape;
}

downloadURI = (uri, name) => {
    var link = document.createElement('a');
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
}

Download = (type) =>{
    if (type === 'PNG'){
        var dataURL = stage.toDataURL({ pixelRatio: 2 });
        downloadURI(dataURL, 'whiteboard.png');
    }
    else if (type === 'JPG'){
        var dataURL = stage.toDataURL({ pixelRatio: 2 });
        downloadURI(dataURL, 'whiteboard.jpeg');
    }
}

readURL = (input) => {
    if (input.files && input.files[0]) {
        reader.onload = function(e) {
            url = reader.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

loadImage = async(img) => {
    return new Promise((resolve,reject) =>{
        img.onload = async() => {
            kon_image.image(img);
            resolve(true);
        };
    });
};

addImage = async() => {
    if (url !== null){
        groupNode = new Konva.Group({
            x: 100,
            y: 100,
            id: `group-${groupID}`,
            draggable: true,
        });
        var tr = new Konva.Transformer({
            anchorSize:5,
            rotateEnabled:false,
            borderEnabled: false,
        });
        kon_image = new Konva.Image({
            x: 100,
            y: 100,
            id: `image-${groupID}`
        });
        var imageObj1 = new Image();
        imageObj1.src = url;
        await loadImage(imageObj1);
        groupNode.add(tr);
        groupNode.add(kon_image);
        tr.nodes([kon_image]);
        layer.add(groupNode);
        layer.draw();
        groupID = groupID+1;
        socket.emit('sendupdate',{ type:'Image', id: groupID, params:[url,groupNode.id(),kon_image.id()]});
        kon_image.on('transformend', (e) =>{
            var par = e.target.attrs;
            socket.emit('sendupdate',{type: "Transform", params:[par.id,par.x,par.y,par.scaleX,par.scaleY]});
        });
    }
}

// Socket functions
textadd = (id, params) => {
    console.log(id,params);
    textID = id;
    textNode = new Konva.Text({
        text: params[0],
        x: params[1],
        y: params[2],
        fontSize: params[3],
        fill: params[4],
        width: params[5],
        draggable: true,
        id: params[6],
        });
    layer.add(textNode);
};

lineadd = (id,params) =>{
    lineID = id;
    lastLine = new Konva.Line({
        stroke: params[0],
        strokeWidth: params[1],
        globalCompositeOperation: params[2],
        points: params[3],
        draggable: true,
        id: params[4],
        });
    layer.add(lastLine);
};

imgadd = async(id,params) => {
    groupID = id;
    groupNode = new Konva.Group({
        x: 100,
        y: 100,
        id: params[1],
        draggable: true,
    });
    var tr = new Konva.Transformer({
        anchorSize:5,
        rotateEnabled:false,
        borderEnabled: false,
    });
    kon_image = new Konva.Image({
        x: 100,
        y: 100,
        id: params[2],
    });
    var imageObj1 = new Image();
    imageObj1.src = params[0];
    await loadImage(imageObj1);   
    groupNode.add(tr);
    groupNode.add(kon_image);
    tr.nodes([kon_image]);
    layer.add(groupNode);
    kon_image.on('transformend', (e) =>{
        var par = e.target.attrs;
        socket.emit('sendupdate',{type: "Transform", params:[par.id,par.x,par.y,par.scaleX,par.scaleY]});
    });
    console.log('im here'); 
}

updatetext = (params) => {
    console.log(params);
    var uptext = stage.findOne('#'+params[0]);
    uptext.text(params[1]);
    uptext.fontSize(params[2]);
    uptext.fill(params[3]);
    uptext.width(params[4]);
}

drag = (params) => {
    var dragtext = stage.findOne('#'+params[0]);
    dragtext.x(params[1]);
    dragtext.y(params[2]);
}

rectadd = (id,params) =>{
    groupID = id;
    shapegp = new Konva.Group({
        x: params[0],
        y: params[1],
        id: `group-${id-1}`,
        draggable: true,
    })
    var shapetr = new Konva.Transformer({
        rotateEnabled: false,
        borderEnabled: false,
        anchorSize:5,
    })
    rectNode = new Konva.Rect({
        x: params[0],
        y: params[1],
        width: params[2],
        height: params[3],
        fill: '#ed6f07',
        draggable: false,
        id: params[4],
        stroke: 'black',
        strokeWidth: 2,
    })
    shapetr.nodes([rectNode]);
    shapegp.add(rectNode);
    shapegp.add(shapetr);
    layer.add(shapegp);
    rectNode.on('transformend', (e) =>{
        var par = e.target.attrs;
        socket.emit('sendupdate',{type: "Transform", params:[par.id,par.x,par.y,par.scaleX,par.scaleY]});
    });
}

ovaladd = (id,params) =>{
    groupID = id;
    shapegp = new Konva.Group({
        x: params[0],
        y: params[1],
        id: `group-${id-1}`,
        draggable: true,
    })
    var shapetr = new Konva.Transformer({
        rotateEnabled: false,
        borderEnabled: false,
        anchorSize:5,
    })
    ovalNode = new Konva.Ellipse({
        x: params[0],
        y: params[1],
        radiusX: params[2],
        radiusY: params[3],
        fill: "#0aae25",
        draggable: false,
        id: params[4],
        stroke: 'black',
        strokeWidth: 2,
    })
    shapetr.nodes([ovalNode]);
    shapegp.add(ovalNode);
    shapegp.add(shapetr);
    layer.add(shapegp);
    ovalNode.on('transformend', (e) =>{
        var par = e.target.attrs;
        socket.emit('sendupdate',{type: "Transform", params:[par.id,par.x,par.y,par.scaleX,par.scaleY]});
    });
}

rhombadd = (id,params) => {
    groupID = id;
    shapegp = new Konva.Group({
        x: params[0],
        y: params[1],
        id: `group-${id-1}`,
        draggable: true,
    })
    var shapetr = new Konva.Transformer({
        rotateEnabled: false,
        borderEnabled: false,
        anchorSize:5,
    })
    rhombNode = new Konva.Rect({
        x: params[0],
        y: params[1],
        width: params[2],
        height: params[2],
        rotation: 45,
        fill: '#ff0000',
        draggable: false,
        id: params[3],
        stroke: 'black',
        strokeWidth: 2,
    })
    shapetr.nodes([rhombNode]);
    shapegp.add(rhombNode);
    shapegp.add(shapetr);
    layer.add(shapegp);
    rhombNode.on('transformend', (e) =>{
        var par = e.target.attrs;
        socket.emit('sendupdate',{type: "Transform", params:[par.id,par.x,par.y,par.scaleX,par.scaleY]});
    });
}

paragmadd = (id,params) => {
    groupID = id;
    shapegp = new Konva.Group({
        x: params[0],
        y: params[1],
        id: `group-${id-1}`,
        draggable: true,
    })
    var shapetr = new Konva.Transformer({
        rotateEnabled: false,
        borderEnabled: false,
        anchorSize:5,
    })
    paraNode = new Konva.Line({
        x: params[0],
        y: params[1],
        points: params[2],
        fill: '#00D2FF',
        stroke: 'black',
        strokeWidth: 2,
        closed: true,
        draggable: false,
        id: params[3],
    });
    shapetr.nodes([paraNode]);
    shapegp.add(paraNode);
    shapegp.add(shapetr);
    layer.add(shapegp);
    paraNode.on('transformend', (e) =>{
        var par = e.target.attrs;
        socket.emit('sendupdate',{type: "Transform", params:[par.id,par.x,par.y,par.scaleX,par.scaleY]});
    });
}

arrowadd = (id,params) =>{
    groupID = id;
    shapegp = new Konva.Group({
        x: params[0][0],
        y: params[0][1],
        id: `group-${id-1}`,
        draggable: true,
    })
    var shapetr = new Konva.Transformer({
        rotateEnabled: false,
        borderEnabled: false,
        anchorSize:5,
    })
    arrowNode = new Konva.Arrow({
        x: params[0][0],
        y: params[0][1],
        points: params[0],
        fill: 'black',
        stroke: 'black',
        strokeWidth: 2,
        draggable: false,
        id: params[1],
    });
    shapetr.nodes([arrowNode]);
    shapegp.add(arrowNode);
    shapegp.add(shapetr);
    layer.add(shapegp);
    arrowNode.on('transformend', (e) =>{
        var par = e.target.attrs;
        socket.emit('sendupdate',{type: "Transform", params:[par.id,par.x,par.y,par.scaleX,par.scaleY]});
    });
}

updatetf = (params) => {
    if (params[1] === null){
        return;
    }
    var uptf = stage.findOne('#'+params[0]);
    uptf.x(params[1]);
    uptf.y(params[2]);
    uptf.scaleX(params[3]);
    uptf.scaleY(params[4]);
}

socket.on('userct', (payload)=>{
    document.getElementById("content").innerHTML = payload;
});

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}

socket.on('newuser',(state) =>{
    if (state === []){
        return;
    }
    asyncForEach(state, async(data) => {
        switch(data.type){
            case 'Text':
                textadd(data.id,data.params);
                break;
            case 'Line':
                lineadd(data.id,data.params);
                break;
            case 'Image':
                await imgadd(data.id,data.params);
                break;
            case 'Delete':
                var del = stage.findOne('#'+data.params);
                del.destroy();
                break;
            case 'Delete-GP':
                var delgp = stage.findOne('#'+data.params);
                delgp.destroyChildren();
                break;
            case 'updateText':
                updatetext(data.params);
                break;
            case 'drag':
                drag(data.params);
                break;
            case 'Rect':
                rectadd(data.id,data.params);
                break;
            case 'Oval':
                ovaladd(data.id,data.params);
                break;
            case 'Rhomb':
                rhombadd(data.id,data.params);
                break;
            case 'Para':
                paragmadd(data.id,data.params);
                break;
            case 'Arrow':
                arrowadd(data.id,data.params);
                break;
            case 'Transform':
                updatetf(data.params);
                break;
        }
        layer.draw();
    });
});

socket.on('getupdate',(data) => {
    switch(data.type){
        case 'Text':
            textadd(data.id,data.params);
            break;
        case 'Line':
            lineadd(data.id,data.params);
            break;
        case 'Image':
            imgadd(data.id,data.params);
            break;
        case 'Delete':
            var del = stage.findOne('#'+data.params);
            del.destroy();
            break;
        case 'Delete-GP':
            var delgp = stage.findOne('#'+data.params);
            delgp.destroyChildren();
            break;
        case 'updateText':
            updatetext(data.params);
            break;
        case 'drag':
            drag(data.params);
            break;
        case 'Rect':
            rectadd(data.id,data.params);
            break;
        case 'Oval':
            ovaladd(data.id,data.params);
            break;
        case 'Rhomb':
            rhombadd(data.id,data.params);
            break;
        case 'Para':
            paragmadd(data.id,data.params);
            break;
        case 'Arrow':
            arrowadd(data.id,data.params);
            break;
        case 'Transform':
            updatetf(data.params);
            break;
    }
    layer.draw();
})

/*
// OCR 
*/

// Flags
var ocrisPaint = false;

// Objects
var ocrLine;

// Stage
var ocrstage = new Konva.Stage({
    container: 'ocrcanvas',
    width: width*0.88,
    height: height/2,
})
ocrstage.getContainer().style.border = '1px solid black';

// Layer creations and adding to stage
var ocrlayer = new Konva.Layer();
ocrstage.add(ocrlayer)
var ocrstageRect =  new Konva.Rect({ 
    x:0,
    y:0,
    width: width*0.88,
    height: height/2,
    fill: '#ffffff'
})
ocrlayer.add(ocrstageRect);

// Functionality
ocrstage.on('mousedown touchstart', (e) => {
    ocrisPaint = true;
    var pos = ocrstage.getPointerPosition();
    ocrLine = new Konva.Line({
        stroke: '#ff0000',
        strokeWidth: 5,
        globalCompositeOperation: 'source-over',
        points: [pos.x, pos.y],
        draggable: false,
    });
    ocrlayer.add(ocrLine);
});

ocrstage.on('mouseup touchend', (e) => {
    ocrisPaint = false;
})

ocrstage.on('mousemove touchmove', (e) => {
    if (!ocrisPaint) {
        return;
    }
    const pos = ocrstage.getPointerPosition();
    var newPoints = ocrLine.points().concat([pos.x, pos.y]);
    ocrLine.points(newPoints);
    ocrlayer.batchDraw();
});

OCRtext = () => {
    var imgURL = ocrstage.toDataURL();
    Tesseract.recognize(imgURL,'eng').then(({ data: { text } }) => {
        if (text !== null){
            var ocrtext = new Konva.Text({
                text: text,
                x: 100,
                y: 100,
                fontSize: 20,
                draggable: true,
                width: 200,
                id: `text-${textID}`
            });
            textID = textID+1;
            layer.add(ocrtext);
            layer.draw();
            socket.emit('sendupdate',{ type:'Text', id: textID, params: [text,100,100,20,'#000000',200,ocrtext.id()]});
        }
    })
}

OCRclear = () => {
    ocrlayer.find('Line').destroy();
    ocrlayer.draw();
}
