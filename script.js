const modal = document.getElementById("tradeModal"),
      btn = document.getElementById("openModalBtn"),
      span = document.querySelector(".close"),
      form = document.getElementById("tradeForm"),
      closePosBtn = document.getElementById("closePosBtn"),
      closeDetails = document.getElementById("closeDetails"),
      pasteArea = document.getElementById("pasteArea"),
      imgPreview = document.getElementById("imgPreview"),
      tradeBody = document.getElementById("tradeBody");

const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/*';

let currentImageData = "";
let editingPosId = null;

// --- Image Handling ---
pasteArea.onclick = () => fileInput.click();
fileInput.onchange = e => { if (e.target.files[0]) handleImage(e.target.files[0]); };
window.addEventListener('paste', e => {
    if (modal.style.display === "block") {
        const item = Array.from(e.clipboardData.items).find(x => x.type.indexOf("image") !== -1);
        if (item) handleImage(item.getAsFile());
    }
});

function handleImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        currentImageData = e.target.result;
        imgPreview.src = currentImageData;
        imgPreview.style.display = "block";
        pasteArea.innerHTML = "Image Attached! ✅";
    };
    reader.readAsDataURL(file);
}

// --- Table Rendering ---
function renderTable() {
    const trades = JSON.parse(localStorage.getItem("trades")) || [];
    tradeBody.innerHTML = "";
    const sorted = [...trades].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    sorted.forEach((t) => {
        const row = document.createElement('tr');
        if (t.netPnl && t.netPnl.trim() !== "") row.classList.add("closed-row");
        
        row.innerHTML = `
            <td>${new Date(t.timestamp).toLocaleDateString()}</td>
            <td style="color:#FF5A00"><b>${t.posId}</b></td>
            <td>${t.name}</td>
            <td style="color:${t.pos==='Long'?'#4ecca3':'#e94560'}">${t.pos}</td>
            <td>${t.qty}</td>
            <td>${t.margin || '-'}</td>
            <td>${t.entryPrice || '-'}</td>
            <td>${t.exitPrice || '-'}</td>
            <td><small>SL: ${t.slPrice || '-'}<br>TP: ${t.tpPrice || '-'}</small></td>
            <td style="color:${parseFloat(t.netPnl) >= 0 ? '#4ecca3':'#e94560'}"><b>${t.netPnl || '-'}</b></td>
            <td><img src="${t.img}" class="trade-img" onerror="this.src='https://via.placeholder.com/50?text=None'" onclick="event.stopPropagation();"></td>
        `;
        row.onclick = (e) => { if (e.target.tagName !== 'IMG') editTrade(t.posId); };
        tradeBody.appendChild(row);
    });
}

function editTrade(posId) {
    const trades = JSON.parse(localStorage.getItem("trades")) || [];
    const t = trades.find(item => item.posId == posId);
    if (!t) return;

    editingPosId = posId;
    document.getElementById("tradeTime").value = t.timestamp.slice(0, 16);
    document.getElementById("posId").value = t.posId;
    document.getElementById("tradeName").value = t.name;
    document.getElementById("position").value = t.pos;
    document.getElementById("quantity").value = t.qty;
    document.getElementById("margin").value = t.margin || "";
    document.getElementById("entryPrice").value = t.entryPrice || "";
    document.getElementById("slPrice").value = t.slPrice || "";
    document.getElementById("tpPrice").value = t.tpPrice || "";
    document.getElementById("exitPrice").value = t.exitPrice || "";
    document.getElementById("netPnl").value = t.netPnl || "";
    
    currentImageData = t.img || "";
    imgPreview.src = currentImageData;
    imgPreview.style.display = currentImageData ? "block" : "none";
    closeDetails.style.display = (t.netPnl) ? "block" : "none";
    modal.style.display = "block";
}

// --- Form & Button Actions ---
btn.onclick = () => {
    editingPosId = null; currentImageData = ""; form.reset();
    document.getElementById("tradeTime").value = new Date().toISOString().slice(0, 16);
    closeDetails.style.display = "none"; imgPreview.style.display = "none";
    pasteArea.innerHTML = "Click & <b>Ctrl+V</b> to Paste";
    modal.style.display = "block";
};

closePosBtn.onclick = () => closeDetails.style.display = "block";
span.onclick = () => modal.style.display = "none";

form.onsubmit = e => {
    e.preventDefault();
    let trades = JSON.parse(localStorage.getItem("trades")) || [];
    const data = {
        timestamp: document.getElementById("tradeTime").value,
        posId: document.getElementById("posId").value,
        name: document.getElementById("tradeName").value,
        pos: document.getElementById("position").value,
        qty: document.getElementById("quantity").value,
        margin: document.getElementById("margin").value,
        entryPrice: document.getElementById("entryPrice").value,
        slPrice: document.getElementById("slPrice").value,
        tpPrice: document.getElementById("tpPrice").value,
        exitPrice: document.getElementById("exitPrice").value,
        netPnl: document.getElementById("netPnl").value,
        img: currentImageData
    };

    if (editingPosId !== null) {
        const idx = trades.findIndex(t => t.posId == editingPosId);
        if (idx !== -1) trades[idx] = data;
    } else { trades.push(data); }

    localStorage.setItem("trades", JSON.stringify(trades));
    modal.style.display = "none";
    renderTable();
};

document.getElementById("modalDeleteBtn").onclick = () => {
    if (editingPosId && confirm("Delete trade?")) {
        let trades = JSON.parse(localStorage.getItem("trades")).filter(t => t.posId != editingPosId);
        localStorage.setItem("trades", JSON.stringify(trades));
        modal.style.display = "none";
        renderTable();
    }
};

renderTable();
