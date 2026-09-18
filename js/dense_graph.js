class DenseVertex{
    constructor(key, size){
        this.key = key;
        this.level = 1;
        // key: `${from.key}->${to.key}` -> { from: DenseVertex, to: DenseVertex, weight: int }
        this.outgoingEdges = new Map();
        // this.incomingEdges = [];
        // key: `${from.key}->${to.key}` -> { from: DenseVertex, to: DenseVertex } — condensation edges
        this.outgoingCanonicalEdges = new Map();
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

    mark_DFS(marked, x, u, z){
        for(const [k, edge] of x.outgoingEdges){
            const j = edge.weight;
            const x = edge.from;
            const y = edge.to;
            if(j < z.level){
                if(marked.has(y)){
                    marked.add(x);
                    continue;
                }
                if(y === u){
                    marked.add(u);
                }
                if(y.level < z.level){
                    y.level = z.level;
                    this.mark_DFS(marked, y, u, z);
                }
            }
            if(marked.has(y)){
                marked.add(x);
            }
        }
    }

    fixComponents(marked, u, z){
        for(const x of marked){
            if(x !== z){
                this.canonical.union(x.key, z.key);
                if(x.outgoingCanonicalEdges.has(`${x.key}->${z.key}`)){
                    x.outgoingCanonicalEdges.delete(`${x.key}->${z.key}`);
                    z.incomingCanonicalEdges.delete(x);
                    if(x.outgoingEdges.has(`${x.key}->${z.key}`)){
                        x.outgoingEdges.delete(`${x.key}->${z.key}`);
                    }
                }
                if(z.outgoingCanonicalEdges.has(`${z.key}->${x.key}`)){
                    z.outgoingCanonicalEdges.delete(`${z.key}->${x.key}`);
                    x.incomingCanonicalEdges.delete(z);
                    if(z.outgoingEdges.has(`${z.key}->${x.key}`)){
                        z.outgoingEdges.delete(`${z.key}->${x.key}`);
                    }
                }
                for(const [_, edge] of x.outgoingCanonicalEdges){
                    const y = edge.to;
                    y.incomingCanonicalEdges.delete(x);
                    if(x.outgoingEdges.has(`${x.key}->${y.key}`)){
                        x.outgoingEdges.delete(`${x.key}->${y.key}`);
                    }
                    if(! z.outgoingCanonicalEdges.has(`${z.key}->${y.key}`)){
                        z.outgoingCanonicalEdges.set(`${z.key}->${y.key}`, {from: z, to: y});
                        z.outgoingEdges.set(`${z.key}->${y.key}`, { from: z, to: y, weight: y.level });
                        y.incomingCanonicalEdges.add(z);
                    }
                }
                x.outgoingCanonicalEdges.clear();
                for(const y of x.incomingCanonicalEdges){
                    y.outgoingCanonicalEdges.delete(`${y.key}->${x.key}`);
                    if(y.outgoingEdges.has(`${y.key}->${x.key}`)){
                        y.outgoingEdges.delete(`${y.key}->${x.key}`);
                    }
                    if(!z.incomingCanonicalEdges.has(y)){
                        y.outgoingCanonicalEdges.set(`${y.key}->${z.key}`, {from: y, to:z});
                        y.outgoingEdges.set(`${y.key}->${z.key}`, { from: y, to: z, weight: z.level });
                        z.incomingCanonicalEdges.add(y);
                    }

                }
                x.incomingCanonicalEdges.clear();
            }
        }
        for(const j of z.c.keys()){
            z.c.set(j, 0);
        }
        let A = new Map();
        let temp = new Map(z.outgoingEdges);
        for(const [_, edge] of temp){
            const y = edge.to;
            const j = edge.weight;
            if(j <= y.level){
                z.outgoingEdges.delete(`${z.key}->${y.key}`);
                A.add(`${z.key}->${y.key}`, {from: z, to: y});
            }
        }
        return A;
    }


    fixVariables(newComponents, path){
        while(newComponents.size > 0){
            const firstKey = newComponents.keys().next().value;
            const {from: x, to: y} = newComponents.get(firstKey);
            newComponents.delete(firstKey);
            path.push(y);
            if(x.level >= y.level){
                y.level = x.level+1;
            }else{
                const j = Math.round(Math.log2(Math.min(y.level - x.level, y.incomingCanonicalEdges.size)));
                y.c.set(j, y.c.get(j) + 1);
                if (y.c.get(j) === 3 * Math.pow(2, j)) {
                    y.c.set(j, 0);
                    y.level = Math.max(y.level, y.b.get(j) + Math.pow(2, j));
                    y.b.set(j, y.level);
                }
            }
            const temp = new Map(y.outgoingEdges);
            for (const [edgeKey, edge] of temp) {
                const z = edge.to;
                const ll = edge.weight;
                if (ll <= y.level) {
                    y.outgoingEdges.delete(edgeKey);                        
                    newComponents.set(`${y.key}->${z.key}`, { from: y, to: z });
                }
            }
            x.outgoingEdges.set(`${x.key}->${y.key}`, { from: x, to: y, weight: y.level });
        }
    }

    *addEdgeSteps(from, to) {
        const u = this.vertices[this.canonical.find(from)];
        const z = this.vertices[this.canonical.find(to)];
        const v = this.vertices[from];
        const w = this.vertices[to];
        const cycle = false;
        let marked = new Set();
        let newComponents = new Map();
        yield { path: [v.key, w.key], message: `Adding edge (${v.key}, ${w.key})` };

        if (u === z || u.outgoingCanonicalEdges.has(`${u.key}->${z.key}`)) {
            this.edges.push({from: v.key, to: w.key});
            yield { path: [u.key, z.key],
                message: "Already in the same component — no structural update needed",
                highlightEdges: false,
            };
            return false;
        }
        if(u.level < z.level){
            this.edges.push({from: v.key, to: w.key});
            z.incomingCanonicalEdges.add(u);
            u.outgoingCanonicalEdges.set(`${u.key}->${z.key}`, {from: u, to: z});
            u.outgoingEdges.set(`${u.key}->${z.key}`, { from: u, to: z, weight: z.level });
            yield{path: [u.key, z.key],
                message: `u.level < z.level — recorded condensation edge (${u.key}, ${z.key})`};
        }else{
                z.level = u.level+1;
                this.mark_DFS(marked, z, u, z);
                const DFS_path = [...marked];
                if( marked.has(z)){
                    cycle = true;
                    yield{path: DFS_path, message: "DFS found cycle"};
                    this.edges.push({from: v.key, to: w.key});
                    newComponents = this.fixComponents(DFS_path, u, z);
                    yield { redraw: true, message: "Components merged — regrouping" };
                }else{
                    yield{path: DFS_path, message: "DFS didnt find cycle"};
                    this.edges.push({from: v.key, to: w.key});
                    newComponents.set(`${u.key}->${z.key}`, {from: u, to: z});
                    z.incomingCanonicalEdges.add(u);
                    u.outgoingCanonicalEdges.set(`${u.key}->${z.key}`, {from: u, to: z});
                    u.outgoingEdges.set(`${u.key}->${z.key}`, { from: u, to: z, weight: z.level });
                }
                const fixed_vertices = [];
                this.fixVariables(newComponents, fixed_vertices);
                yield{path: fixed_vertices, message: "Variables fixed in highlighted vertices", highlightEdges: false};
            }
            return cycle;
        }
}