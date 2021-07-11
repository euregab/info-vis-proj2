const width = 600;
const height = 450;
const margin = 50;

let svg = d3.select("div.draw")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

d3.select("button.submitter")
  .on("click",draw)

function draw(){
  let value = d3.select("input.deserializer")._groups[0][0].value
  //console.log(value)
  let tree = deserialize(value.split(" "))
  console.log(tree)
  console.log(getPositions(tree))
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

    let pointer = tree

    localGetPositions(pointer, currCoordinates, prevCoordinates)
    return nodes

    /*
    this local function traverses the binary tree in post-order
    when it is possible to assign a position to a node,
    it inserts a new object with the coordinates of the node to the array nodes
    this array will be the data to use with d3 to draw both nodes and edges
    */
    function localGetPositions(pointer, currCoordinates, prevCoordinates){
        console.log("new Call.\n pointer: " + pointer.toString() + ".\n current:" + currCoordinates.toString() + ".\n previous: " + prevCoordinates.toString())
        /*
        LEFT CHILD TRAVERSAL
        */

        /*
        returns true if the current node collides with a horizontal edge, that is:
        if the current node is at least to the left of a ledge node
        and it is also at least lower than that ledge node
        */

        const doesCollide = (ledge) => 
            currCoordinates[0] <= ledge[0] &&
            currCoordinates[1] >= ledge[1]

        const isFurtherRight = (ledge) =>
            (ledge[0] < currCoordinates[0]) ||
            (ledge[0] <= prevCoordinates[0] && ledge[1] <= prevCoordinates[1])

        let ledges = globalLedges.filter(isFurtherRight)
        console.log("ledges: " + ledges.toString())

        if(ledges.some(doesCollide)){
          console.log("collision")
          console.log(ledges, currCoordinates)
          return -1
        }

        if(pointer.left !== null){
            console.log("entering left")
            prev = currCoordinates
            curr = [currCoordinates[0], currCoordinates[1] + 1]
            let forward = localGetPositions(pointer.left, curr, prev)
            if(forward === -1){
              return -1
            }
        }

        /*CONFIRMING NODE POSITION*/

        node = {
            label: pointer.val,
            prevCoordinates: prevCoordinates,
            currCoordinates: currCoordinates
        }

        nodes.unshift(node)

        /*
        LEFT CHILD COMPUTATION
        */

        if(pointer.right !== null){
            console.log("entering right")
            prev = currCoordinates
            i = 1
            curr = [currCoordinates[0] + 1, currCoordinates[1]]
            globalLedges.push(curr)
            /*
            while the left subtree collides with an already placed edge or node,
            it moves his rootnode one to the right and tries again
            */
            let forward = localGetPositions(pointer.right, curr, prev)
            console.log(forward)
            while(forward === -1){
                console.log("forward:" + forward)
                console.log(curr)
                i++
                curr = [currCoordinates[0] + i, currCoordinates[1]]
                globalLedges.pop()
                globalLedges.push(curr)
                forward = localGetPositions(pointer.right, curr, prev)
                if(i >= 50) break
            }
        }

        console.log(1)
        return 1
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
