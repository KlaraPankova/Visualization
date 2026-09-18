function generateGraph() {
    if (appState.mode === null) {
        alert("Please select a mode first.");
        return;
    }
    
    const n = parseInt(document.getElementById("nodeInput").value, 10);
    if (!Number.isInteger(n) || n <= 0) return;

    appState.graph = appState.mode === "sparse"
        ? new SparseGraph(n)
        : new DenseGraph(n);

    lockModeSelection();
    redraw();
}

function resetGraph() {

    document.getElementById("mode-sparse-btn").disabled = false;
    document.getElementById("mode-dense-btn").disabled = false;
    document.getElementById("mode-sparse-btn").classList.remove("active");
    document.getElementById("mode-dense-btn").classList.remove("active");
    document.getElementById("mode-status").textContent = "No mode selected";
    if (cy) cy.elements().remove();
    appState.graph = null;
    // document.getElementById("log-panel").innerHTML = "";
}

let currentSteps = null;

function addEdge() {
    if (!appState.graph) {
        alert("Please generate a graph first.");
        return;
    }
    if (currentSteps !== null) {
        alert("Please finish the current edge addition before adding a new edge.");
        return;
    }
    const from = parseInt(document.getElementById("sourceNode").value, 10);
    const to = parseInt(document.getElementById("targetNode").value, 10);
    if (!Number.isInteger(from) || !Number.isInteger(to)) return;
    if (from === to) {
        alert("Self-loops are not allowed.");
        return;
    }
    currentSteps = appState.graph.addEdgeSteps(from, to);
    setSteppingUI(true);
    advanceStep();
}

function nextStep() {
    advanceStep();
}

function advanceStep() {
    const result = currentSteps.next();
    if (result.done) {
        currentSteps = null;
        setSteppingUI(false);
        redraw();
        return;
    }
    const step = result.value;
    if (step.redraw) {
        redraw();
    } else {
        applyStepToRender(step);
    }
    if (step.message) logMessage(step.message);
}

function setSteppingUI(isStepping){
    document.getElementById("add-edge-btn").disabled = isStepping;
    document.getElementById("next-step-bnt").disabled = !isStepping;
    document.getElementById("sourceNode").disabled = isStepping;
    document.getElementById("targetNode").disabled = isStepping;
}

function logMessage(text){
    const panel = document.getElementById("log-panel");
    const entry = document.createElement("div");
    entry.textContent = text;
    panel.appendChild(entry);
    panel.scrollTop = panel.scrollHeight;
}
