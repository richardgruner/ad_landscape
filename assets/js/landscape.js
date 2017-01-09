
var relations_data = JSON.parse(relations);
var company_data = JSON.parse(companies);

// ------------------------------------------------------------------------------------
// format data (this is the hard part)

// names
from = _.pluck(relations_data, "from");
to   = _.pluck(relations_data, "to");

external = _.pluck(company_data,"company");
names_index = _.union(from, to); // joins *unique* names (creates look up table)
//names_index = _.union(names_index, external);
//names_index = _.pluck(company_data,"company")

console.log(from)
console.log(to)
console.log(external)
//names_index = _.chain(companies).pluck("company").flatten().uniq().value() 

// nodes = names_index.map(function(d,i){ 
//     return { "name":d, "group":1 }; 
// });

console.log(names_index)


var company_type2group = {};
company_type2group["Startup"] = 1;
company_type2group["OEM"] = 3;
company_type2group["Supplier"] = 2;

//nodes = company_data.map(function(d,i){ 
nodes = names_index.map(function(d,i){ 
	return { "name":d, "group":1,
		"info_content": d+" is a manufacturer of AD stuff" }; 
});

nodes2 = company_data.map(function(d,i){ 
	return { 
		"name":d["company"], 
		"img":d["img"],
		"group":company_type2group[d["company_type"]],
		"info_content": d["company"]+" is a manufacturer of AD stuff" }; 
});


new_nodes = [];
var values = Object.keys(names_index).map(function(key){
    return names_index[key];
});

console.log("external nodes",nodes2,names_index,values);

for (var i in nodes2) {
    //console.log("name",nodes2[i]["name"]);
    //console.log(names_index.indexOf(i.name))
    if (!names_index.includes(nodes2[i]["name"])){
        new_nodes.push(nodes2[i])
    }
}
console.log("new nodes",new_nodes);

nodes = _.union(nodes,new_nodes)

//console.log("Num of nodes",nodes.length)
// links
links = relations_data.map(function(d,i){ 
    return { 

        "source": _.indexOf(names_index, d["from"]),
        "target": _.indexOf(names_index, d["to"]), 
        "type": _.pluck(d["data"], "type"),
        "info": _.pluck(d["data"], "info"),
        "ref": _.pluck(d["data"],"ref")
    };
});


console.log("Num of links",links.length)
for (var key in links) {
    if (links.hasOwnProperty(key)) {
        //console.log(key, links[key]);
    }
}


// make final graph
graph = { "nodes": nodes, "links": links };

// logs
//console.log(intro_data);
//console.log(graph);

// tags
//collapses data into array of tags
//_.pluck(_.flatten(_.pluck(intro_data, "data")), "tag") // without method-chaining
tags_index = _.chain(relations_data).pluck("data").flatten().pluck("type").uniq().value() // with chaining, neater syntax 
console.log("tags_index",tags_index);

tag_colors = {};
tags_index.map(function(d,i){
    //tag_colors[d] = d3.hcl(Math.floor(i/tags_index.length * 255), 100, 50).toString();

    tag_colors[d] = d3.hcl(Math.floor(2/tags_index.length * 255), 100, 50).toString();
}); 

relationship2strength = {};
relationship2strength["Partners"]=6;
relationship2strength["Investment"]=6;
relationship2strength["Ownership"]=6;

relationship2color = {};

relationship2color["Partners"]='#bcd3ff';//'#9EC0FF';
relationship2color["Investment"]='#306CDB';
relationship2color["Ownership"]='#02008c';//'#00318C';


// ------------------------------------------------------------------------------------
// viz

var width = 700,
    height = 800;

var color = d3.scale.category20();

svg1 = d3.select("#landscape").append("svg")
   .classed("svg-container", true) //container class to make it responsive
   .attr("preserveAspectRatio", "xMinYMin meet")
   .attr("viewBox","0 0 " + width + " " + height)
//    .attr("width", width)
//    .attr("height", height);


var force = d3.layout.force()
    .charge(-600) // worked well: 400
    .linkDistance(130)
    .size([width, height])
    .nodes(graph.nodes)
    .links(graph.links)
    .start();

// define arrows (svg markers elements)
svg1.append('svg:defs').selectAll("marker")
.data(tags_index)
    .enter()
  .append('svg:marker')
    .attr('id', function(d,i) { return "arrow-" + d; })
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 0)  // how far away the arrow goes from the circle (manual tune)
    .attr("refY", 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', function(d,i) { return tag_colors[d]; }); //svg2 update

var link = svg1.selectAll("g")
  .data(graph.links)
    .enter()
  .append("line")
    .attr("class", "link")
    .style("stroke", function(d,i) { return relationship2color[d["type"]];}) //tag_colors[ d["type"][0] ]; })
    .style("stroke-width", function(d) { return relationship2strength[d["type"]]; })
    //.attr("marker-end", function(d,i) { 
      //  return "url(#arrow-" + d["type"][0] + ")"; 
    //})
    .on("click", function(d){
      console.log(d);
      
      window.open(d["ref"]);
      //alert("You clicked on node ");
    });


// var linkLinks = svg1.selectAll("g")
//   .data(force.links())
//   .append("svg:a")
//   .attr("xlink:href", function(d){ return "http://www.google.com"})
//   .attr("target", "_blank")
//   .append("text")
//   .attr("dy", 3.5)
//   .attr("dx", -5.5)
//   .attr("text-anchor", "start")
//   .text(function(d) { return d.info})
//   .call(force.drag);

// var linkText = svg1.selectAll("g")
//             .data(force.links())
//           .append("text")
//       .attr("font-family", "Arial, Helvetica, sans-serif")
//       .attr("x", function(d) {
//           if (d.target.x > d.source.x) { return (d.source.x + (d.target.x - d.source.x)/2); }
//           else { return (d.target.x + (d.source.x - d.target.x)/2); }
//       })
//             .attr("y", function(d) {
//           if (d.target.y > d.source.y) { return (d.source.y + (d.target.y - d.source.y)/2); }
//           else { return (d.target.y + (d.source.y - d.target.y)/2); }
//       })
//       .attr("fill", "Black")
//             .style("font", "normal 40px Arial")
//             .attr("dy", ".35em")
//             .text(function(d) { console.log("test"); return "test"; });


// var linkText2 = svg1.selectAll("g")
//   .data(graph.links)
//     .enter()
//     //.append("a")
//     //.attr("xlink:href", "http://www.google.com")
//   .append("text")
  
//   .attr("font-family", "Arial, Helvetica, sans-serif")
//    .attr("fill", "Black")
//             .style("font", "normal 9px Arial")
//     .attr("class", "text")
//     .attr("dx", -30)
//     .attr("dy", 2)
//     //.text(function(d) { return "http://"+d.info})
//     //.

//     .html(function(d) { return "<a href='"+d["ref"]+"'>"+d.info+"</a>"})
//     .call(force.drag);

//     link.append("svg:title")
//     .text(function(d) { 
//       console.log("tooltip");
//       return d.info; });



// linkText2.on("mouseover", function(d) {
//         console.log("mouseover stuff");
//         console.log(d);
//         d3.select(this).select("line").transition()
//         //.style("font", "normal 9px Arial")
//         .attr("fill", "Blue");
//         //    .style("font", "normal 9px Arial")


//       });
// var linkTip = d3.tip()
//     .attr('class', 'd3-tip')
//     .offset([50, 50])
//     // .offset(function(){
//     //   this.getBBox().height / 2, 0
//     // })
     
//     //.direction('s')
//     .html(function (d) {
//       //console.log("tip triggered");
//     return "<a href='"+d["ref"]+"'>"+d.info+"</a>" ;
// })

// svg1.call(linkTip);



 var tip2 = d3.select("body").append("div") 
       .style("position", "absolute")
       .style("z-index", "10")
      //.attr("class", "tip2")
      .style("opacity", 0)


// .on("mouseover", function(d) {    
//             div.transition()
//         .duration(500)  
//         .style("opacity", 0);
//       div.transition()
//         .duration(200)  
//         .style("opacity", .9);  
//       div .html(
//         '<a href= "http://google.com">' + // The first <a> tag
//         formatTime(d.date) +
//         "</a>" +                          // closing </a> tag
//         "<br/>"  + d.close)  
//         .style("left", (d3.event.pageX) + "px")      
//         .style("top", (d3.event.pageY - 28) + "px");


var div = d3.select("body")
  .append("div")  // declare the tooltip div 
  .attr("class", "tooltip")              // apply the 'tooltip' class
  .style("opacity", 0);



link.on("mouseover2", function(d) {

    console.log("tooltip touched");
    div.transition()
    .duration(500)
    .style("opacity", 0);
       div.transition()
         .duration(200)  
         .style("opacity", .9);  
    tip2.transition()
      .duration(500)
      .style("font-size", "12px")
      .style("font", "normal 12px Arial")
      .style("opacity", .9)
      div 
      .html(
        "<a href='"+d["ref"]+"' target='_blank'>"+d.info+"</a>"
        // "<a href='"+d["ref"]+"' target='_blank'>"+1234+"</a>"
        )
        //'<a href= "http://google.com">' + // The first <a> tag
        //formatTime(d.date) +
        //"</a>" +                          // closing </a> tag
        //"<br/>"  + d.)  
        .style("left", (d3.event.pageX) + "px")      
        .style("top", (d3.event.pageY - 28) + "px");
    // tip2.html(html)
    // linkTip.html(html)
    //   .style("left", (d3.event.pageX + 5) + "px")
    //   .style("top", (d3.event.pageY - 28) + "px")
  });


var tip3 = d3.tip()
    .attr('class', 'd3-tip')
    //.transition()
    
    .offset([100, 0])
    .html(function (d) {
    return  "<div class='button'>  <button type='submit'>" + "<a href='"+d["ref"]+"' target='_blank'>"+d.info+"</a>"+"</button> </div></form>" ;
    //return  "<a href='"+d["ref"]+"'>"+d.info+"</a>" ;


})
    // tip3.transition()
    // .delay(500)
    // .style('display', 'none');


svg1.call(tip3);


link.on("mouseover",tip3.show)

link.on("mouseout",tip3.hide)
  // link.on("mouseover", function(d) {
  //   //console.log("over");
  //   //html = "Location:" + d;// + " " + d.location + 
  //    // "<br>Floruit Date:" + " " + d.floruitDate;

  //   tip2.transition()
  //     .duration(500)
  //     .style("font-size", "42px")
  //     .style("font", "normal 42px Arial")
  //     .style("opacity", .9)
  //   // tip2.html(html)
  //   // linkTip.html(html)
  //   //   .style("left", (d3.event.pageX + 5) + "px")
  //   //   .style("top", (d3.event.pageY - 28) + "px")
  
  // });
link.on("mouseout2", function() {
  //console.log("out");
   tip2.transition()
     .duration(500)
     .style("opacity", 0)
});



// var tooltip =
//    d3.select('body').append("div")
//     .style("position", "absolute")
//     .style("z-index", "10")
//     .style("visibility", "hidden")
//     .text("a simple tooltip");

   


  //link.on("mouseover", function(){return tooltip.style("visibility", "visible");})
  // link.on("mousemover", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
   // .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

    //link.on('mouseover', linkTip.show); //Added
    //link.on('mouseout', linkTip.hide); //Added 

    // link.on('mouseover', mouseover); //Added
    // link.on('mouseout', mouseout); //Added 

// function mouseover() {
//     // linkTip.show;
//     this.setAttribute('stroke-width', 30);
//     tooltip.transition()
//             .duration(1)
//             .style("opacity", 0);
// }

// function mouseout() {
//     d3.select(this).select("line").transition()
// }



    //link.on('mouseover', linkText2.show); //Added
    //link.on('mouseout', linkText2.hide); //Added 

// var node = svg1.selectAll("g")
//   .data(graph.nodes)
//     .enter()
//   .append("circle")
//     .attr("class", "node")
//     .attr("r", 20)
//     .style("fill", function(d) { return color(d.group); })
//   .call(force.drag);

var image_size = 30

//Toggle stores whether the highlighting is on
var toggle = 0;
//Create an array logging what is connected to what
var linkedByIndex = {};
for (i = 0; i < graph.nodes.length; i++) {
    linkedByIndex[i + "," + i] = 1;
};
graph.links.forEach(function (d) {
    linkedByIndex[d.source.index + "," + d.target.index] = 1;
});

//This function looks up whether a pair are neighbours
function neighboring(a, b) {
    return linkedByIndex[a.index + "," + b.index];
}
function connectedNodes() {
    if (toggle == 0) {
        //Reduce the opacity of all but the neighbouring nodes
        d = d3.select(this).node().__data__;
        node.style("opacity", function (o) {
            return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
        });
        link.style("opacity", function (o) {
            return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;
        });
        //Reduce the op
        toggle = 1;
    } else {
        //Put them back to opacity=1
        node.style("opacity", 1);
        link.style("opacity", 1);
        toggle = 0;
    }
}


// Add again when we have meaningfull stuff to show for each company!!
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-5, 0])
    .html(function (d) {
    return  "<div class='button'>  <button type='submit'>" + d["info_content"] +"</button> </div></form>" ;
})
svg1.call(tip);



var node = svg1.selectAll(".node")
    .data(graph.nodes)
    .enter()
    //.append("circle")
    //.attr("r", 25)
    //.style("fill", function(d) { return color(d.group); })
    .append("image")
    .attr("class", "node")
    .attr("xlink:href", function(d) {return "https://s3.amazonaws.com/intellifyus/ad_landscape/assets/images/icons/"+d.name.replace(" ", "_").toLowerCase()+".png";})
    //.attr("xlink:href", function(d) {return "assets/images/icons/"+d.name.toLowerCase()+".png";})
    //.attr("xlink:href", function(d) {return "assets/images/icons/"+d.img;})
    .attr("x", -image_size)
    .attr("y", -image_size)
    .attr("width", image_size*2)
    .attr("height", image_size*2)
     .call(force.drag)
     //.on('mouseover', tip.show) //Added
 //.on('mouseout', tip.hide) //Added 
.on('dblclick', connectedNodes);
// var node2 = svg1.selectAll(".node")
//     .data(graph.nodes)
//     .enter()
//     .append("circle")
//     .attr("class", "node")
//     .attr("r", 40)
//     .style("fill", function(d) { return color(d.group); })
//     .call(force.drag);
// node.append("image")
//  .attr("xlink:href", "https://github.com/favicon.ico")
//  .attr("x", -8)
//       .attr("y", -8)
//       .attr("width", 16)
//       .attr("height", 16);

// node.append("text")
//       .attr("dx", 12)
//       .attr("dy", ".35em")
//       .text(function(d) { return d.name });

// add text, only show the first 5 characters (via _.first("blah", 5) )
// var text = svg1.selectAll("g")
//   .data(graph.nodes)
//     .enter()
//   .append("text")
//     .attr("class", "text")
//     .attr("dx", -6)
//     .attr("dy", 2)
//     .text(function(d) { return d.name})
//   .call(force.drag);



 r = 30
force.on("tick", function() {
    link.attr("x1", function(d) { return Math.max(r, Math.min(width - r, d.source.x)); })
        .attr("y1", function(d) { return Math.max(r, Math.min(height - r, d.source.y)); })
        .attr("x2", function(d) { return Math.max(r, Math.min(width - r, d.target.x)); })
        .attr("y2", function(d) { return Math.max(r, Math.min(height - r, d.target.y)); });
    
        // link.attr("x1", function(d) { return d.source.x; })
        // .attr("y1", function(d) { return d.source.y; })
        // .attr("x2", function(d) { return d.target.x; })
        // .attr("y2", function(d) { return d.target.y; });
    


// link.attr("d", function(d) {
//     var dx = d.target.x - d.source.x,
//         dy = d.target.y - d.source.y,
//         dr = 75/d.linknum;  //linknum is defined above
//     return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
//   });

    //node.attr("cx", function(d) { return d.x; })
    //    .attr("cy", function(d) { return d.y; });
    

    //node2.attr("cx", function(d) { return d.x; })
     //   .attr("cy", function(d) { return d.y; });

    //node2.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
      node.attr("transform", function(d) { return "translate(" + Math.max(r, Math.min(width - r, d.x)) + "," + 
        Math.max(r, Math.min(height - r, d.y)) + ")"; });


    //node.attr("cx", function(d) { return d.x = Math.max(r, Math.min(w - r, d.x)); })
    //    .attr("cy", function(d) { return d.y = Math.max(r, Math.min(h - r, d.y)); });

    // text.attr("x", function(d) { return d.x; })
     //   .attr("y", function(d) { return d.y; });

     // linkText2
     //  .attr("x", function(d) {
     //      if (d.target.x > d.source.x) { return (d.source.x + (d.target.x - d.source.x)/2); }
     //      else { return (d.target.x + (d.source.x - d.target.x)/2); }
     //  })
     //  .attr("y", function(d) {
     //      if (d.target.y > d.source.y) { return (d.source.y + (d.target.y - d.source.y)/2); }
     //      else { return (d.target.y + (d.source.y - d.target.y)/2); }
     //  });




});
var legend = svg1.selectAll(".legend")
      .data(["Partners","Investment","Ownership"])
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function(d) { return relationship2color[d];})
    .style("opacity",0.7);


  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });



