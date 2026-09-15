class DenseVertex{
    constructor(key, size){
        this.key = key;
        this.level = 1;
        this.outgoingEdges = new Map(); // toKey -> weight (int)
        // this.incomingEdges = [];
        this.outgoingCanonicalEdges = new Map(); // toKey -> DenseVertex, condensation out-edges
        this.incomingCanonicalEdges = new Set(); // DenseVertex objects — condensation vertices pointing here
        this.b = new Map();
        this.c = new Map();

        // for j in range(0, round(log2(n)+1))
        const upperExclusive = Math.round(Math.log2(size) + 1); // matches range(0, round(log2(n)+1))
        for (let j = 0; j < upperExclusive; j++) {
            this.b.set(j, 1);
            this.c.set(j, 0);
        }
    }
}

class DenseGraph{
    constructor(size){
        this.vertices = [];
        this.edges = [];
        this.canonical = new Union_find(size);
        for (let i = 0; i < size; i++) {
            this.vertices.push(new DenseVertex(i, size));
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

    *addEdgeSteps(from, to) {
        yield { path: [from, to], message: "dense addEdge not implemented" };
    }
}