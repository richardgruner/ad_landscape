
relations_data = [
  {
    "from": "BMW",
    "n": 1,
    "to": "Drive",
    "data": [
      {
        "type": "Partnership",
        "frequency": 1
      }
    ]
  },
  {
    "from": "GM",
    "n": 1,
    "to": "Cruise",
    "data": [
      {
        "type": "Acquisition",
        "frequency": 1
      }
    ]
  },
    {
    "from": "GM",
    "n": 1,
    "to": "Lyft",
    "data": [
      {
        "type": "Investment",
        "frequency": 1
      }
    ]
  }]


company_data = [
  {
    "company":"BMW",
    "company_type":"OEM",
    "technology_type":"AD",
    "img":"assets/images/icons/bmw.png"
  },
    {
    "company":"DriveNow",
    "company_type":"Supplier",
    "technology_type":"AD",
    "img":"assets/images/icons/gm.png"
  },
    {
    "company":"GM",
    "company_type":"OEM",
    "technology_type":"AD",
    "img":"assets/images/icons/drivenow.png"
  },
  {
    "company":"Cruise",
    "company_type":"Startup",
    "technology_type":"AD",
    "img":"assets/images/icons/cruise.png"
  },
  {
    "company":"Lyft",
    "company_type":"Startup",
    "technology_type":"AD",
    "img":"assets/images/icons/lyft.png"
  }
]

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
    return { "name":d, "group":1 }; 
});

 nodes2 = company_data.map(function(d,i){ 
     return { "name":d["company"], "img":d["img"],"group":company_type2group[d["company_type"]] }; 
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
        "info": _.pluck(d["data"], "info")
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
relationship2strength["Partners"]=1;
relationship2strength["Investment"]=4;
relationship2strength["Acquisition"]=7;



//relationship_strength = {};
//tags_index.map(function(d,i){
//    relationship_strength[d] = relationship2strength[i];
//});


// ------------------------------------------------------------------------------------
// viz

var width = 960,
    height = 500;

var color = d3.scale.category20();

svg1 = d3.select("#landscape").append("svg")
    .attr("width", width)
    .attr("height", height);

var force = d3.layout.force()
    .charge(-400)
    .linkDistance(170)
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
    .attr('refX', 25)  // how far away the arrow goes from the circle (manual tune)
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
    .style("stroke", function(d,i) { return tag_colors[ d["type"][0] ]; })
    //.style("stroke-width", function(d) { return 1.5; })
    .style("stroke-width", function(d) { return relationship2strength[d["type"]]; })
    //.attr("marker-end", function(d,i) { 
      //  return "url(#arrow-" + d["type"][0] + ")"; 
    //})
    ;


var linkText = svg1.selectAll("g")
            .data(force.links())
          .append("text")
      .attr("font-family", "Arial, Helvetica, sans-serif")
      .attr("x", function(d) {
          if (d.target.x > d.source.x) { return (d.source.x + (d.target.x - d.source.x)/2); }
          else { return (d.target.x + (d.source.x - d.target.x)/2); }
      })
            .attr("y", function(d) {
          if (d.target.y > d.source.y) { return (d.source.y + (d.target.y - d.source.y)/2); }
          else { return (d.target.y + (d.source.y - d.target.y)/2); }
      })
      .attr("fill", "Black")
            .style("font", "normal 40px Arial")
            .attr("dy", ".35em")
            .text(function(d) { console.log("test"); return "test"; });

var linkText2 = svg1.selectAll("g")
  .data(graph.links)
    .enter()
    //.append("a")
    //.attr("xlink:href", "http://www.google.com")
  .append("text")
  
  .attr("font-family", "Arial, Helvetica, sans-serif")
   .attr("fill", "Black")
            .style("font", "normal 9px Arial")
    .attr("class", "text")
    .attr("dx", -30)
    .attr("dy", 2)
    //.text(function(d) { return "http://"+d.info})
    .text(function(d) { return d.info})
  .call(force.drag);

// var node = svg1.selectAll("g")
//   .data(graph.nodes)
//     .enter()
//   .append("circle")
//     .attr("class", "node")
//     .attr("r", 20)
//     .style("fill", function(d) { return color(d.group); })
//   .call(force.drag);

var image_size = 32

var node = svg1.selectAll(".node")
    .data(graph.nodes)
    .enter()
    //.append("circle")
    //.attr("r", 25)
    //.style("fill", function(d) { return color(d.group); })
    .append("image")
    .attr("class", "node")
    .attr("xlink:href", function(d) {return "assets/images/icons/"+d.name.toLowerCase()+".png";})
    //.attr("xlink:href", function(d) {return "assets/images/icons/"+d.img;})
    .attr("x", -image_size)
    .attr("y", -image_size)
    .attr("width", image_size*2)
    .attr("height", image_size*2)
     .call(force.drag);

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
var text = svg1.selectAll("g")
  .data(graph.nodes)
    .enter()
  .append("text")
    .attr("class", "text")
    .attr("dx", -6)
    .attr("dy", 2)
    .text(function(d) { return d.name})
  .call(force.drag);

force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    
    //node.attr("cx", function(d) { return d.x; })
    //    .attr("cy", function(d) { return d.y; });
    

    //node2.attr("cx", function(d) { return d.x; })
     //   .attr("cy", function(d) { return d.y; });

    //node2.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
      node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    // text.attr("x", function(d) { return d.x; })
     //   .attr("y", function(d) { return d.y; });

     linkText2
      .attr("x", function(d) {
          if (d.target.x > d.source.x) { return (d.source.x + (d.target.x - d.source.x)/2); }
          else { return (d.target.x + (d.source.x - d.target.x)/2); }
      })
      .attr("y", function(d) {
          if (d.target.y > d.source.y) { return (d.source.y + (d.target.y - d.source.y)/2); }
          else { return (d.target.y + (d.source.y - d.target.y)/2); }
      });



});

//.attr("transform", "translate(-40,-40)");
// ------------------------------------------------------------------------------------




