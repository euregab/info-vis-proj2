import TreeNode from "./serial-deserial"

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