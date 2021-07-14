const default_radius = 12
const default_multiplier = 100
const width = 600;
const height = 450;
const margin = 50;

let svg = d3.select("div.draw")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

d3.select("button.submitter")
  .on("click",draw)

function drawEdge(context, start, end, xMultiplier, yMultiplier){
  let [sX, sY] = start
  let [eX, eY] = end
  console.log(sX, sY, eX, eY)
  context.moveTo(sX * xMultiplier + margin, sY * yMultiplier + margin)
  context.lineTo(eX * xMultiplier + margin, eY * yMultiplier + margin)
  return context.toString()
}

function getExtremities(positions){
  let coordinates = positions.map((e) => e.current)
  let xs = coordinates.map((e) => e[0])
  let ys = coordinates.map((e) => e[1])
  let maxX = d3.max(xs)
  let maxY = d3.max(ys)
  return [maxX, maxY]
}

function draw(){
  svg.selectAll("path").remove()
  svg.selectAll("g.node").remove()
  d3.select(".alert").remove()
  let value = d3.select("input.deserializer")._groups[0][0].value.trim()
  let tree = deserialize(value.split("-"))
  if(tree === null || value === ""){
    d3.select("div.header")
    .append("div")
    .attr("class", "alert")
    .style("fill", "red")
    .text("INVALID INPUT")
  }
  let positions = getPositions(tree)
  let [maxX, maxY] = getExtremities(positions)
  let xMultiplier = default_multiplier
  let yMultiplier = default_multiplier
  if(maxX * default_multiplier >= width - (margin * 2)){
    xMultiplier = (width - (margin * 2)) / maxX
  }
  if(maxY * default_multiplier >= height - (margin * 2)){
    yMultiplier = (height - (margin * 2)) / maxY
  }
  let edges = svg.selectAll("path")
              .data(positions)
              .enter()
              .append("path")
              //.style("stroke", "black")
              //.style("stroke-width", "4px")
              .attr("d", function(e){
                let path = d3.path()
                return drawEdge(path, e.previous, e.current, xMultiplier, yMultiplier)
              })

  let nodes = svg.selectAll("g.node")
              .data(positions)
              .enter()
              .append("g")
              .attr("class", "node")
              .attr("transform", function(e){
                return "translate(" +
                (e.current[0] * xMultiplier + margin).toString() +
                ", " +
                (e.current[1] * yMultiplier + margin).toString() +
                ")"
              }) 

  nodes.append("circle")
      //.style("stroke", "black")
      //.style("fill", "sandybrown")
      .attr("r", default_radius)

  nodes.append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", default_radius / 1.1)
      .style("fill", "black")
      .text((e) => e.label)
}


//FUNCTIONS AND CLASSES
/**
 * Gets a TreeNode as input and returns an Array of node objects.
 * Every node is assigned a position ((x,y) coordinates)
 * @param {TreeNode} tree 
 * @returns {Array} nodes
 */

function getPositions(tree){
    const nodes = []
    
    let currCoordinates = [0,0]
    let prevCoordinates = [0,0]

    //everytime a horizontal child-node is expanded, its coordinates are added to this array
    let globalLedges = []

    //true if the node is a left node
    let isFromAbove = true

    let pointer = tree

    localGetPositions(pointer, currCoordinates, prevCoordinates, isFromAbove)
    return nodes

    /*
    this local function traverses the binary tree in post-order
    when it is possible to assign a position to a node,
    it inserts a new object with the coordinates of the node to the array nodes
    this array will be the data to use with d3 to draw both nodes and edges
    */

    function localGetPositions(pointer, currCoordinates, prevCoordinates, isFromAbove){

      if(pointer === null){
        throw {name: "NullNodeException", message: "Entered a null node"}
      }
      
      //returns true if the current node collides with an existing edge
      function doesCollide(ledge){
        return currCoordinates[0] <= ledge[0] && currCoordinates[1] >= ledge[1]
      }

      //if a collision occurs throw a CollisionException
      if(isFromAbove && globalLedges.some(doesCollide)){
        let collision = globalLedges.filter(doesCollide)
        throw {
          name: "CollisionException",
          message: "node: ".concat(pointer.val.toString()).concat("\ncollision: ").concat(collision.toString()).concat(currCoordinates.toString())
        }
      }

      //Exploring left side of the tree
      if(pointer.left !== null){
        try{
          let curr = [currCoordinates[0], currCoordinates[1] + 1]
          let prev = currCoordinates
          localGetPositions(pointer.left, curr, prev, true) //true because we are traversing downward
        }
        catch(e){
          if(e.name === "CollisionException"){
            console.log("going back upward")
            throw e
          }
          else{
            throw e
          }
        }
      }

      //Confirming node position
      let node = {
        label: pointer.val,
        current: currCoordinates,
        previous: prevCoordinates
      }

      nodes.push(node)

      //if the confirmed node comes from left, its coordinates are added to globalLedges
      if(!isFromAbove){
        globalLedges.push(currCoordinates)
      }

      //Exploring right side of the tree
      if(pointer.right !== null){
        let rightJumps = 1
        let prev = currCoordinates
        while(true){
          try{
            let curr = [currCoordinates[0] + rightJumps, currCoordinates[1]]
            localGetPositions(pointer.right, curr, prev, false)
          }
          catch(e){
            if(e.name === "CollisionException"){
              rightJumps++
              continue
            }
          }
          break
        }
      }

      return

    }
    
}

/**
 * Credits to bytebot for the serialize and deserialize functions
 * (https://shareablecode.com/snippets/serialize-and-deserialize-binary-tree-javascript-solution-w3v2-NPt6)
 */

/**
 * Definition for a binary tree node.
 */
class TreeNode {
    constructor(val) {
      this.val = val;
      this.left = null;
      this.right = null;
    }
}
  
  /**
   * Encodes a tree to a single string.
   *
   * @param {TreeNode} root
   * @return {string}
   */
  const serialize = root => {
    if (!root) {
      return null;
    }
  
    const data = [];
  
    // Level-order traversal
    const queue = [root];
    while (queue.length > 0) {
      const node = queue.shift();
  
      if (node) {
        data.push(node.val);
  
        queue.push(node.left);
        queue.push(node.right);
      } else {
        data.push(null);
      }
    }
  
    // Clean up the trailing nulls in data
    while (data.length > 0 && data[data.length - 1] === null) {
      data.pop();
    }
  
    return JSON.stringify(data);
  };
  
  /**
   * Decodes your encoded data to tree.
   *
   * @param {string} data
   * @return {TreeNode}
   */
  const deserialize = data => {
    // Sanity checks
    /*
    try {
      data = JSON.parse(data);
    } catch (e) {
      return null;
    }
    */
    if (!(data instanceof Array) || data.length === 0) {
      return null;
    }
  
    const root = new TreeNode(data.shift());
    const queue = [root];
  
    while (data.length > 0) {
      const node = queue.shift();
  
      // Left node
      let val = data.shift();
      if (typeof val !== 'undefined' && val !== null) {
        node.left = new TreeNode(val);
        queue.push(node.left);
      }
  
      // Right node
      val = data.shift();
      if (typeof val !== 'undefined' && val !== null) {
        node.right = new TreeNode(val);
        queue.push(node.right);
      }
    }
  
    return root;
  };
    
  /**
   * Your functions will be called as such:
   * deserialize(serialize(root));
   */
