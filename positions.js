import TreeNode from "./serial-deserial"

/**
 * Gets a TreeNode as input and returns an Array of node objects.
 * Every node is assigned a position ((x,y) coordinates)
 * @param {TreeNode} tree 
 * @returns {Array} nodes
 */
export default function getPositions(tree){
    const nodes = []
    
    let currCoordinates = [0,0]
    let prevCoordinates = [0,0]

    //everytime a horizontal child-node is expanded, its coordinates are added to this array
    let ledges = []

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
            ledge[0] < currCoordinates[0]

        if(ledges.some(doesCollide)) return -1

        if(pointer.left != null){
            prev = currCoordinates
            curr = [currCoordinates[0], currCoordinates[1] + 1]
            if(localGetPosition(pointer.left, curr, prev) == -1) return -1
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

        if(pointer.right != null){
            prev = currCoordinates
            i = 1
            curr = [currCoordinates[0] + 1, currCoordinates[1]]
            ledges = ledges.filter(isFurtherRight)
            ledges.push(curr)
            /*
            while the left subtree collides with an already placed edge or node,
            it moves his rootnode one to the right and tries again
            */
            while(localGetPosition(pointer.right, curr, prev) == -1){
                i++
                curr = [currCoordinates[0] + i, currCoordinates[1]]
                ledges.pop()
                ledges.push(curr)
            }
        }

        return 1
    }
    
}