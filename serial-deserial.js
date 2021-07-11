/**
 * Credits to bytebot for the serialize and deserialize functions
 * (https://shareablecode.com/snippets/serialize-and-deserialize-binary-tree-javascript-solution-w3v2-NPt6)
 */

/**
 * Definition for a binary tree node.
 */
 export default class TreeNode {
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
    try {
      data = JSON.parse(data);
    } catch (e) {
      return null;
    }
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
  
  export { serialize, deserialize };
  
  /**
   * Your functions will be called as such:
   * deserialize(serialize(root));
   */