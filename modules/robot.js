

var Figures={
    Rectangle:function(ctx,node){
        ctx.beginPath();
        ctx.fillStyle=node.fillStyle;
        ctx.strokeStyle="blue";
        ctx.fillRect(node.x, node.y, node.w, node.h);
        ctx.fillStyle="black";
        ctx.font="10px Verdana";
        ctx.textBaseline="top";
        node.textfill(ctx);
    },
    Circle:function(ctx,node){
        ctx.beginPath();
        ctx.fillStyle=node.fillStyle;
        ctx.ellipse(node.x+node.w/2,node.y+node.h/2, node.w/2, node.h/2, 0, 0, 2 * Math.PI);
        ctx.fill();
        node.textfill(ctx);
    },
    Diamond:function(ctx,node){
        ctx.beginPath();
        ctx.fillStyle=node.fillStyle;
        ctx.moveTo(node.x,node.y+node.h/2);
        ctx.lineTo(node.x+node.w/2,node.y);
        ctx.lineTo(node.x+node.w,node.y+node.h/2);
        ctx.lineTo(node.x+node.w/2,node.y+node.h);
        ctx.fill();
        node.textfill(ctx);
    }
}

var anchors=model.defaultAnchors("Rectangle");
model.addNode(new model.node(10,10,100,100,anchors,"A Square, dblclick me to edit the text","green","Rectangle"));
anchors=model.defaultAnchors("Circle");
model.addNode(new model.node(30,140,100,100,anchors,"A Circle, click on the center handle to move","white", "Circle"));
anchors=model.defaultAnchors("Rectangle");
model.addNode(new model.node(250,80,150,150,anchors,"A Diamond, click on the corner handles to resize.","yellow", "Diamond"));
model.addNode(new model.node(350,250,150,100,anchors,"A Rectangle, drag from the diamond to here to link.","Cyan", "Rectangle"));

model.addLink(new model.link(1,2,7,3,"dblclick me to edit"));
//model.addLink(new model.link(3,2,6,6,"Link 1"));
model.addLink(new model.link(2,3,1,1,"Link 2"));

model.init("myCanvas");
model.draw();

// Add an event listener
document.addEventListener("selectionChanged", function(e) {
    document.all("divSelectedNode").innerText="Selected node:" + e.detail;
  });