const modal = document.getElementById("tradeModal"), 
      btn = document.getElementById("openModalBtn"), 
      span = document.querySelector(".close");
const form = document.getElementById("tradeForm"), 
      submitBtn = document.getElementById("submitBtn"), 
      modalDeleteBtn = document.getElementById("modalDeleteBtn");
const closePosBtn = document.getElementById("closePosBtn"), 
      closeDetails = document.getElementById("closeDetails");
const imageInput = document.getElementById("imageFile"), 
      pasteArea = document.getElementById("pasteArea"), 
      imgPreview = document.getElementById("imgPreview");
const modalContent = document.querySelector(".modal-content");
const netPnlInput = document.getElementById("netPnl");

let editingPosId = null, currentImageData = "";

function formatDateForInput(dateString) {
    const d = dateString ? new Date(dateString) : new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function handleImageData(data) {
    currentImageData = data;
    imgPreview.src = data;
    imgPreview.style.display = "block";
    pasteArea.innerHTML = "Image Captured!";
}

function updateModalTheme() {
    const isClosed = netPnlInput.value.trim() !== "";
    if (isClosed) {
        modalContent.classList.add("closed-state");
        closePosBtn.style.display = "none"; 
    } else {
        modalContent.classList.remove("closed-state");
        if (editingPosId !== null) closePosBtn.style.display = "block";
    }
}

imageInput.onchange = (e) => {
    const reader = new FileReader();
    reader.onload = () => handleImageData(reader.result);
    if (e.target.files[0]) reader.readAsDataURL(e.target.files[0]);
};

window.addEventListener('paste', e => {
    if (modal.style.display === "block") {
        const item = Array.from(e.clipboardData.items).find(x => x.type.indexOf("image") !== -1);
        if (item) {
            const reader = new FileReader();
            reader.onload = () => handleImageData(reader.result);
            reader.readAsDataURL(item.getAsFile());
        }
    }
});

netPnlInput.addEventListener('input', updateModalTheme);

btn.onclick = () => {
    editingPosId = null; currentImageData = ""; form.reset();
    document.getElementById("tradeTime").value = formatDateForInput();
    closeDetails.style.display = "none";
    closePosBtn.style.display = "none";
    modalContent.classList.remove("closed-state");
    imgPreview.style.display = "none";
    modal.style.display = "block";
};

closePosBtn.onclick = () => {
    closeDetails.style.display = closeDetails.style.display === "none" ? "block" : "none";
};

span.onclick = () => modal.style.display = "none";

function renderTable() {
    const trades = JSON.parse(localStorage.getItem("trades")) || [];
    const tbody = document.getElementById("tradeBody");
    tbody.innerHTML = "";
    
    const sortedTrades = [...trades].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    sortedTrades.forEach((t) => {
        const row = document.createElement('tr');
        const isClosed = t.netPnl && t.netPnl.trim() !== "";
        if (isClosed) row.classList.add("closed-row");
        
        row.onclick = () => editTrade(t.posId);

        // Strip symbols like $ or commas for color logic
        const cleanPnl = t.netPnl ? parseFloat(t.netPnl.replace(/[^\d.-]/g, '')) : 0;

        row.innerHTML = `
            <td>${new Date(t.timestamp).toLocaleDateString()}</td>
            <td style="color:#FF5A00"><b>${t.posId}</b></td>
            <td>${t.name}</td>
            <td style="color:${t.pos==='Long'?'#4ecca3':'#e94560'}">${t.pos}</td>
            <td>${t.qty}</td>
            <td>${t.margin || '-'}</td>
            <td>${t.exposure || '-'}</td>
            <td>${t.entryPrice || '-'}</td>
            <td>${t.exitPrice || '-'}</td>
            <td><small>SL: ${t.slPrice || '-'}<br>TP: ${t.tpPrice || '-'}</small></td>
            <td style="color:${cleanPnl >= 0 ? '#4ecca3':'#e94560'}"><b>${t.netPnl || '-'}</b></td>
            <td><img src="${t.img}" class="trade-img" onerror="this.src='https://via.placeholder.com/50?text=None'"></td>
        `;
        tbody.appendChild(row);
    });
}

function editTrade(posId) {
    const trades = JSON.parse(localStorage.getItem("trades")) || [];
    const t = trades.find(item => item.posId === posId);
    if (!t) return;

    editingPosId = posId;
    
    document.getElementById("tradeTime").value = formatDateForInput(t.timestamp);
    document.getElementById("posId").value = t.posId;
    document.getElementById("tradeName").value = t.name;
    document.getElementById("position").value = t.pos;
    document.getElementById("quantity").value = t.qty;
    document.getElementById("margin").value = t.margin || "";
    document.getElementById("exposure").value = t.exposure || "";
    document.getElementById("pattern").value = t.pattern || "";
    
    document.getElementById("entryPrice").value = t.entryPrice || "";
    document.getElementById("exitPrice").value = t.exitPrice || "";
    document.getElementById("slPrice").value = t.slPrice || "";
    document.getElementById("tpPrice").value = t.tpPrice || "";
    document.getElementById("fee").value = t.fee || "";
    document.getElementById("swap").value = t.swap || "";
    document.getElementById("pnl").value = t.pnl || "";
    document.getElementById("netPnl").value = t.netPnl || "";
    document.getElementById("orderId").value = t.orderId || "";
    document.getElementById("exitTime").value = t.exitTime ? formatDateForInput(t.exitTime) : "";

    handleImageData(t.img);
    
    const isClosed = t.netPnl && t.netPnl.trim() !== "";
    closeDetails.style.display = isClosed ? "block" : "none";
    closePosBtn.style.display = isClosed ? "none" : "block";

    updateModalTheme();
    modalDeleteBtn.style.display = "block";
    modal.style.display = "block";
}

form.onsubmit = e => {
    e.preventDefault();
    let trades = JSON.parse(localStorage.getItem("trades")) || [];
    const data = {
        timestamp: new Date(document.getElementById("tradeTime").value).toISOString(),
        posId: document.getElementById("posId").value,
        name: document.getElementById("tradeName").value,
        pos: document.getElementById("position").value,
        qty: document.getElementById("quantity").value,
        margin: document.getElementById("margin").value,
        exposure: document.getElementById("exposure").value,
        pattern: document.getElementById("pattern").value,
        entryPrice: document.getElementById("entryPrice").value,
        exitPrice: document.getElementById("exitPrice").value,
        slPrice: document.getElementById("slPrice").value,
        tpPrice: document.getElementById("tpPrice").value,
        fee: document.getElementById("fee").value,
        swap: document.getElementById("swap").value,
        pnl: document.getElementById("pnl").value,
        netPnl: document.getElementById("netPnl").value,
        orderId: document.getElementById("orderId").value,
        exitTime: document.getElementById("exitTime").value,
        img: currentImageData || 'https://via.placeholder.com/100'
    };

    if (editingPosId !== null) {
        const index = trades.findIndex(t => t.posId === editingPosId);
        if (index !== -1) trades[index] = data;
    } else {
        trades.push(data);
    }

    localStorage.setItem("trades", JSON.stringify(trades));
    renderTable(); modal.style.display = "none";
};

modalDeleteBtn.onclick = () => {
    if (editingPosId !== null && confirm("Delete permanently?")) {
        let trades = JSON.parse(localStorage.getItem("trades"));
        trades = trades.filter(t => t.posId !== editingPosId);
        localStorage.setItem("trades", JSON.stringify(trades));
        renderTable(); modal.style.display = "none";
    }
};

renderTable();