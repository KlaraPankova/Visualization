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