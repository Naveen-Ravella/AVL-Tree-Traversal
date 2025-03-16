class AVLNode {
    constructor(value) {
        this.value = value;
        this.count = 1;
        this.left = null;
        this.right = null;
        this.height = 1;
    }
}

class AVLTree {
    constructor() {
        this.root = null;
    }

    height(node) {
        return node ? node.height : 0;
    }

    getBalance(node) {
        return node ? this.height(node.left) - this.height(node.right) : 0;
    }

    rotateRight(y) {
        let x = y.left;
        let T = x.right;

        x.right = y;
        y.left = T;

        y.height = Math.max(this.height(y.left), this.height(y.right)) + 1;
        x.height = Math.max(this.height(x.left), this.height(x.right)) + 1;

        return x;
    }

    rotateLeft(x) {
        let y = x.right;
        let T = y.left;

        y.left = x;
        x.right = T;

        x.height = Math.max(this.height(x.left), this.height(x.right)) + 1;
        y.height = Math.max(this.height(y.left), this.height(y.right)) + 1;

        return y;
    }

    insert(node, value) {
        if (!node) return new AVLNode(value);

        if (value < node.value) node.left = this.insert(node.left, value);
        else if (value > node.value) node.right = this.insert(node.right, value);
        else return node; 

        node.height = 1 + Math.max(this.height(node.left), this.height(node.right));

        let balance = this.getBalance(node);

        if (balance > 1 && value < node.left.value) return this.rotateRight(node);
        if (balance < -1 && value > node.right.value) return this.rotateLeft(node);
        if (balance > 1 && value > node.left.value) {
            node.left = this.rotateLeft(node.left);
            return this.rotateRight(node);
        }
        if (balance < -1 && value < node.right.value) {
            node.right = this.rotateRight(node.right);
            return this.rotateLeft(node);
        }

        return node;
    }

    findMin(node) {
        while (node.left) node = node.left;
        return node;
    }

    delete(node, value) {
        if (!node) return node;

        if (value < node.value) node.left = this.delete(node.left, value);
        else if (value > node.value) node.right = this.delete(node.right, value);
        else {
            if (!node.left || !node.right) {
                node = node.left ? node.left : node.right;
            } else {
                let temp = this.findMin(node.right);
                node.value = temp.value;
                node.right = this.delete(node.right, temp.value);
            }
        }

        if (!node) return node;

        node.height = 1 + Math.max(this.height(node.left), this.height(node.right));
        let balance = this.getBalance(node);

        if (balance > 1 && this.getBalance(node.left) >= 0) return this.rotateRight(node);
        if (balance > 1 && this.getBalance(node.left) < 0) {
            node.left = this.rotateLeft(node.left);
            return this.rotateRight(node);
        }
        if (balance < -1 && this.getBalance(node.right) <= 0) return this.rotateLeft(node);
        if (balance < -1 && this.getBalance(node.right) > 0) {
            node.right = this.rotateRight(node.right);
            return this.rotateLeft(node);
        }

        return node;
    }

    insertValue(value) {
        this.root = this.insert(this.root, value);
        drawTree();
    }

    deleteValue(value) {
        this.root = this.delete(this.root, value);
        drawTree();
    }
}

let avl = new AVLTree();

function insertNode() {
    let value = parseInt(document.getElementById("value").value);
    if (!isNaN(value)) {
        avl.insertValue(value);
    }
}

function deleteNode() {
    let value = parseInt(document.getElementById("value").value);
    if (!isNaN(value)) {
        avl.deleteValue(value);
    }
}

function drawTree() {
    let svg = d3.select("#tree-container");
    svg.selectAll("*").remove(); // Clear previous tree

    if (!avl.root) return; // If tree is empty, do nothing

    let width = document.getElementById("tree-wrapper").clientWidth;
    let height = document.getElementById("tree-wrapper").clientHeight;

    let treeLayout = d3.tree().size([width - 300, height - 100]); // Adjust width to spread nodes properly

    let root = d3.hierarchy(avl.root, d => d ? [d.left, d.right].filter(n => n) : []);
    let treeData = treeLayout(root);

    let nodes = treeData.descendants();
    let links = treeData.links();

    let g = svg.append("g")
               .attr("transform", `translate(${width / 2}, 50)`); // Move whole tree center

    // Find the root node's position for centering
    let xOffset = nodes.length > 0 ? nodes[0].x : width / 2;

    // Draw links (lines connecting nodes)
    g.selectAll(".link")
        .data(links)
        .enter()
        .append("line")
        .attr("class", "link")
        .attr("x1", d => d.source.x - xOffset)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x - xOffset)
        .attr("y2", d => d.target.y)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 2);

    // Draw nodes (circles)
    g.selectAll(".node")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr("cx", d => d.x - xOffset)
        .attr("cy", d => d.y)
        .attr("r", 20)
        .attr("fill", "#4db8ff")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 2);

    // Draw node values (text)
    g.selectAll(".text")
        .data(nodes)
        .enter()
        .append("text")
        .attr("x", d => d.x - xOffset)
        .attr("y", d => d.y)
        .attr("dy", 5)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text(d => d.data.value);
}
