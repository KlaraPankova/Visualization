function generateGraph() {
    if (appState.mode === null) {
        alert("Please select a mode first.");
        return;
    }
    appState.graph = {};
    lockModeSelection();
}

function resetGraph() {
    appState.graph = null;
    document.getElementById("mode-sparse-btn").disabled = false;
    document.getElementById("mode-dense-btn").disabled = false;
}