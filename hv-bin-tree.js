const default_radius = 10
const default_multiplier = 75
const width = 800;
const height = 600;
const margin = 50;

let svg = d3.select("div.draw")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

document.getElementById("submitter")
  .addEventListener("click",draw)

let input = document.getElementById("inputfile")

input.addEventListener("change", function(){
  d3.select(".alert").remove()
  let fr = new FileReader()
  const file = input.files[0]
  const textType = /text.*/
  
  if(file.type.match(textType)){
    fr.onload = function(event){
      const file = event.target.result
      let tree = null
      serializedTree = null
      try{
        tree = JSON.parse(file)
        serializedTree = serialize(tree)
      }
      catch(e){
        document.getElementById("deserializer").value = ""
        d3.select("div.header")
          .append("div")
          .attr("class", "alert")
          .style("fill", "red")
          .text("ERROR IN READING FILE")
      }
      document.getElementById("deserializer").value = serializedTree
    }

    fr.onerror = function(e){
      document.getElementById("deserializer").value = ""
      d3.select("div.header")
        .append("div")
        .attr("class", "alert")
        .style("fill", "red")
        .text("ERROR IN READING FILE")
    } 

    fr.readAsText(file)
  }
  else{
    document.getElementById("deserializer").value = ""
    d3.select("div.header")
      .append("div")
      .attr("class", "alert")
      .style("fill", "red")
      .text("INVALID FILE")
  }
})

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
  let value = document.getElementById("deserializer").value.trim()
  let opt = document.getElementById("option").value
  let arr = value.split("-").map(function(e){
    if (e === "") return null
    else return e
  })
  let tree = deserialize(arr)
  if(tree === null || value === ""){
    d3.select("div.header")
    .append("div")
    .attr("class", "alert")
    .style("fill", "red")
    .text("INVALID INPUT")
  }
  //WITH ORIGINAL ALGORITHM
  //let positions = getPositions(tree)
  //let [maxX, maxY] = getExtremities(positions)

  //WITH BB ALGORITHM
  let [positions, maxX, maxY] = getPositionsBB(tree, opt)
  let xMultiplier = default_multiplier
  let yMultiplier = default_multiplier
  if(maxX * default_multiplier >= width - (margin * 2)){
    xMultiplier = (width - (margin * 2)) / maxX
  }
  if(maxY * default_multiplier >= height - (margin * 2)){
    yMultiplier = (height - (margin * 2)) / maxY
  }
  //FOR CONSTANT EDGES
  [xMultiplier, yMultiplier] = [Math.min(xMultiplier, yMultiplier), Math.min(xMultiplier, yMultiplier)]
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
 * Every node is assigned a position ((x,y) coordinates).
 * It is based on the bounding box concept
 * @param {TreeNode} tree a binary tree
 * @param {String} option 5 options: "alternate-HV", "alternate-VH", "fixed-H", "fixed-V", "min-offset"
 * @returns {Array} array of node objects with: label, own coordinates, and parent coordinates
 */
 function getPositionsBB(tree, option = "alternate-hv"){

  let options = ["alternate-hv", "alternate-vh", "fixed-h", "fixed-v", "min-offset"]
  let opt = option
  if (!options.includes(option)){
      opt = "alternate-hv"
  }

  let currCoordinates = [0,0]
  let prevCoordinates = [0,0]
  let horizontalPriority = true

  if (opt === "alternate-vh" || opt === "fixed-v"){
      horizontalPriority = false
  }

  let result = localGetPositions(tree, currCoordinates, prevCoordinates, horizontalPriority)

  return result
  
  function localGetPositions(pointer, current, previous, horizontalPriority){

      let nextPriority = horizontalPriority

      if (opt === "alternate-hv" || opt === "alternate-vh"){
          nextPriority = !horizontalPriority
      }

      let node = {
          label: pointer.val,
          current: current,
          previous: previous
      }


      //BASE CASE: leaf node
      if (pointer.left === null && pointer.right === null){
          return [[node], current[0], current[1]]
      }

      //RECURSION
      let [rightFurtherRight, rightFurtherDown] = [current[0], current[1]]
      let [leftFurtherRight, leftFurtherDown] = [current[0], current[1]]
      let leftNextCurrent = [current[0], current[1] + 1]
      let rightNextCurrent = [current[0] + 1, current[1]]
      let leftOffspring = []
      let rightOffspring = []

      if (pointer.left !== null){
          [leftOffspring, leftFurtherRight, leftFurtherDown] = localGetPositions(pointer.left, leftNextCurrent, current, nextPriority)
      }

      if (pointer.right !== null){
          [rightOffspring, rightFurtherRight, rightFurtherDown] = localGetPositions(pointer.right, rightNextCurrent, current, nextPriority)
      }

      // the top-right corner of the left child's bounding box
      let leftLedge = [leftFurtherRight, leftNextCurrent[1]]
      // the bottom-left corner of the right child's bounding box
      let rightLedge = [rightNextCurrent[0], rightFurtherDown]

      //if the two bounding boxes collide, the offset values are > 0
      let offset = getOffset(leftLedge, rightLedge)
      let index = translate(leftOffspring, rightOffspring, offset, opt, horizontalPriority)
      if (index === 0){
        /*
        if the right child is translated to the right,
        its right ledge must also be translated as well
        */
        rightFurtherRight += offset[0]
      }
      if(index === 1){
        /*
        if the left child is translated downwards,
        its bottom ledge must also be translated as well
        */
        leftFurtherDown += offset[1]
      }

      let furtherRight = Math.max(leftFurtherRight, rightFurtherRight)//the extreme right
      let furtherDown = Math.max(leftFurtherDown, rightFurtherDown)//the bottom extreme

      //merges the left and right offsprings and adds at the top the current node
      let currentOffspring = [node].concat(leftOffspring).concat(rightOffspring)

      return [currentOffspring, furtherRight, furtherDown]
  }

  function getOffset(leftLedge, rightLedge){
      let horizontalOffset = leftLedge[0] - rightLedge[0]
      let verticalOffset = rightLedge[1] - leftLedge[1]
      if(horizontalOffset < 0 || verticalOffset < 0){
        return [0,0]
      }
      return [horizontalOffset + 1, verticalOffset + 1]
  }

  function translate(leftOffspring, rightOffspring, offset, option, horizontalPriority){
      if (offset[0] === 0 && offset[1] === 0){
          return -1
      }

      if (option === "min-offset"){
          if(offset.indexOf(Math.min(...offset)) === 0){
              rightOffspring = rightOffspring.map(function(e){
                  let newCurr = e.current
                  newCurr[0] += offset[0]
                  return {
                      label: e.label,
                      current: newCurr,
                      previous : e.previous
                  }
              })
              return 0
          }
          else{
              leftOffspring = leftOffspring.map(function(e){
                  let newCurr = e.current
                  newCurr[1] += offset[1]
                  return {
                      label: e.label,
                      current: newCurr,
                      previous : e.previous
                  }
              })
              return 1
          }
      }

      else{
          if(horizontalPriority){
              rightOffspring = rightOffspring.map(function(e){
                  let newCurr = e.current
                  newCurr[0] += offset[0]
                  return {
                      label: e.label,
                      current: newCurr,
                      previous : e.previous
                  }
              })
              return 0
          }
          else{
              leftOffspring = leftOffspring.map(function(e){
                  let newCurr = e.current
                  newCurr[1] += offset[1]
                  return {
                      label: e.label,
                      current: newCurr,
                      previous : e.previous
                  }
              })
              return 1
          }
      }
      
  }
}

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
   function serialize(tree){
    var arr = [];
    innerSerialize(tree, arr);
    return arr.join("-");
  
    function innerSerialize(tree, arr){
  	  if(!tree){
        arr.push(null);
      } else {
  	    arr.push(tree.val);
        if(tree.left !== null || tree.right !== null){
          innerSerialize(tree.left, arr);
          innerSerialize(tree.right, arr);
        }
      }
    }
  }
  
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
