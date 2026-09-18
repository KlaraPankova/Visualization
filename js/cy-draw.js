
let cy = null;

function ensureCy() {
  if (cy) return cy;
  cy = cytoscape({
    container: document.getElementById("cy"),
    style: [
      {
        selector: "node",
        style: {
          label: "data(id)",
          "background-color": "#8a8f98",
          "border-width": 2,
          "border-color": "#ffffff",
        },
      },
      {
        selector: "edge",
        style: {
          "target-arrow-shape": "triangle",
          "curve-style": "bezier",
          "line-color": "#c7c2b3",
          "target-arrow-color": "#c7c2b3",
        },
      },
      { selector: "node.step-highlight", style: { "border-color": "#e07b1f", "border-width": 4 } },
      { selector: "edge.step-highlight", style: { "line-color": "#e07b1f", "target-arrow-color": "#e07b1f", width: 3 } },
    ],
    wheelSensitivity: 0.25,
  });
  return cy;
}

const PALETTE = ["#1f6f78", "#c1440e", "#7a5ea8", "#4f7942", "#c99a2e", "#2f5d8a", "#a85a7a"];

function redraw() {
  const graph = appState.graph;
  if (!graph) return;

  ensureCy();
  cy.elements().remove();

  const nodeEls = graph.vertices.map((v) => ({ data: { id: String(v.key) } }));
  const edgeEls = graph.edges.map(({ from, to }) => ({
    data: { id: `e-${from}-${to}`, source: String(from), target: String(to) },
  }));
  cy.add([...nodeEls, ...edgeEls]);

  const components = graph.getComponents();
  const colorOfRoot = new Map();
  let colorIndex = 0;
  for (const root of components.keys()) {
    colorOfRoot.set(root, PALETTE[colorIndex % PALETTE.length]);
    colorIndex++;
  }
  for (const [root, members] of components) {
    const color = colorOfRoot.get(root);
    members.forEach((key) => cy.getElementById(String(key)).style("background-color", color));
  }

  const clusters = [...components.values()].filter((members) => members.length > 0);
  cy.layout({ name: "cise", clusters, animate: false }).run();
}


/*function applyStepToRender(step) {
  cy.elements(".step-highlight").removeClass("step-highlight");

  step.path.forEach((key) => cy.getElementById(String(key)).addClass("step-highlight"));

  for (let i = 0; i < step.path.length - 1; i++) {
    const edge = cy.getElementById(`e-${step.path[i]}-${step.path[i + 1]}`);
    if (edge.length) edge.addClass("step-highlight");
  }
}*/

function applyStepToRender(step) {
  cy.elements(".step-highlight").removeClass("step-highlight");

  step.path.forEach((key) => {
    const node = cy.getElementById(String(key));
    if (node.length) node.addClass("step-highlight");
  });

  if (step.highlightEdges === false) return;

  for (let i = 0; i < step.path.length - 1; i++) {
    const a = step.path[i];
    const b = step.path[i + 1];

    const forwardEdge = cy.getElementById(`e-${a}-${b}`);
    const backwardEdge = cy.getElementById(`e-${b}-${a}`);

    if (forwardEdge.length) forwardEdge.addClass("step-highlight");
    else if (backwardEdge.length) backwardEdge.addClass("step-highlight");
  }
}

function addEdgeToCy(from, to) {
  const id = `e-${from}-${to}`;
  if (!cy.getElementById(id).length) {
    cy.add({ data: { id, source: String(from), target: String(to) } });
  }
}

function relayoutClusters() {
  const graph = appState.graph;
  const components = graph.getComponents();

  const colorOfRoot = new Map();
  let colorIndex = 0;
  for (const root of components.keys()) {
    colorOfRoot.set(root, PALETTE[colorIndex % PALETTE.length]);
    colorIndex++;
  }
  for (const [root, members] of components) {
    const color = colorOfRoot.get(root);
    members.forEach((key) => cy.getElementById(String(key)).style("background-color", color));
  }

  const clusters = [...components.values()].filter((m) => m.length > 0);
  cy.layout({ name: "cise", clusters, animate: false }).run();
}