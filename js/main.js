const cy = cytoscape({
  container: document.getElementById("cy"),
  elements: [
    { data: { id: "a1" } },
    { data: { id: "a2" } },
    { data: { id: "a3" } },
    { data: { id: "a1a2", source: "a1", target: "a2" } },
    { data: { id: "a2a3", source: "a2", target: "a3" } },
    { data: { id: "a3a1", source: "a3", target: "a1" } },

    { data: { id: "b1" } },
    { data: { id: "b2" } },
    { data: { id: "b3" } },
    { data: { id: "b1b2", source: "b1", target: "b2" } },
    { data: { id: "b2b3", source: "b2", target: "b3" } },
    { data: { id: "b3b1", source: "b3", target: "b1" } },

    { data: { id: "bridge", source: "a1", target: "b1" } },
  ],
  style: [
    { selector: "node", style: { label: "data(id)", "background-color": "#1f6f78" } },
    { selector: "edge", style: { "target-arrow-shape": "triangle", "curve-style": "bezier" } },
  ],
});


  cy.layout({
    name: "cise",
    clusters: [
      ["a1", "a2", "a3"],
      ["b1", "b2", "b3"],
    ],
    animate: true,
  }).run();
