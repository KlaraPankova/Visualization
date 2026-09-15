const Result = {
    UNDER: 0,
    OVER: 1,
    CYCLE: 2,
}

class SparseVertex {
    constructor(key){
        this.key = key;
        this.level = 1;
        this.outgoingEdges = new Set();
        this.incomingEdges = [];
    }
}

class SparseGraph {
    constructor(size) {
        this.vertices = [];
        this.canonical = new Union_find(size);
        this.edges = [];
        for (let i = 0; i < size; i++) {
            this.vertices.push(new SparseVertex(i));
        }
    }

    getComponents() {
        const components = new Map();
        for (let vertex of this.vertices) {
            const root = this.canonical.find(vertex.key);
            if (!components.has(root)) {
                components.set(root, []);
            }
            components.get(root).push(vertex.key);
        }
        return components;
    }

    *addEdgeSteps(from, to) {}
}