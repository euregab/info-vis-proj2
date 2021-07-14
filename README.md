# HV-Drawing of Binary Trees
This project consists of displaying binary trees in the Horizontal-Vertical representation.\
The proposed program uses an algorithm for calculating the positions of the nodes and edges within a virtual grid with integer coordinates.\
This algorithm visits the tree in in-order and makes use of backtracking.\
The visualization part uses the D3.js library to draw based on the results of the previous algorithm

### Usage
* Start an HTTP server in the directory that contains files `index.html` and `hv-bin-tree.js` (example: `python3 -m http.server 8888`)
* Open a web browser and go to `localhost` (you may have to specify the port. in this example it is `8888`) 

