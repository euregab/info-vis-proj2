# HV-Drawing of Binary Trees
This project consists of displaying binary trees in the Horizontal-Vertical representation.\
The proposed program uses an algorithm for calculating the positions of the nodes and edges within a virtual grid with integer coordinates.\
The underlying algorithm is based on the __bounding box__ concept: each subtree is inscribed in the smallest possible rectangle.\
The algorithm calculates the edges of the child rectangles and arranges them so that they do not collide.\
The visualization part uses the __D3.js__ library to draw based on the results of the previous algorithm

### Usage
* Start an HTTP server in the directory that contains files _index.html_, _style.css_ and _hv-bin-tree.js_ (example: `python3 -m http.server 8888`)
* Open a web browser and go to _localhost_ (you may have to specify the port. in this example it is _8888_)
* Type a binary tree as a string (example: `A-B-C-D-E-F-G`)
* You can also import a tree as a text file input
* Select an option from the following:
    * _alternate-hv_ (default)
    * _alternate-vh_
    * _fixed-h_
    * _fixed-v_
    * _min-offset_
* Click _Draw_

