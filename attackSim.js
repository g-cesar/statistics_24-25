// Funzione per generare un colore RGB casuale
function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r},${g},${b})`;
}

// Funzione per disegnare l'istogramma finale basato sui successi
function drawHistogram(successCounts, n, m) {
    const canvas = document.getElementById('probabilityCanvas');
    const ctx = canvas.getContext('2d');

    const canvasWidth = 700;
    const canvasHeight = 500;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const levelCounts = new Array(n + 1).fill(0);
    successCounts.forEach(count => {
        if (count <= n) {
            levelCounts[count]++;
        }
    });

    const barWidth = canvasWidth / (n + 1);
    const maxHeight = Math.max(...levelCounts) * 1.1;
    const histogramColor = getRandomColor();

    for (let i = 0; i <= n; i++) {
        const barHeight = (levelCounts[i] / maxHeight) * canvasHeight;

        ctx.fillStyle = histogramColor;
        ctx.fillRect(i * barWidth, canvasHeight - barHeight, barWidth - 5, barHeight);

        ctx.fillStyle = 'black';
        ctx.fillText(i, i * barWidth + barWidth / 2 - 5, canvasHeight - 10);
        if (levelCounts[i] > 0) {
            ctx.fillText(levelCounts[i], i * barWidth + barWidth / 2 - 5, canvasHeight - barHeight - 10);
        }
    }
}

// Funzione per simulare e disegnare il grafico degli attacchi
function drawAttackSimulation(n, m, p) {
    const canvas = document.getElementById('attackCanvas');
    const ctx = canvas.getContext('2d');
    const successCounts = new Array(m).fill(0);

    const canvasWidth = 700;
    const canvasHeight = 500;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const stepX = canvasWidth / (n + 1);
    const stepY = canvasHeight / (m + 1);

    // Variabile per la legenda
    const legendContainer = document.getElementById('legend');
    legendContainer.innerHTML = '';

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    for (let server = 1; server <= n; server++) {
        const currentX = server * stepX;
        ctx.beginPath();
        ctx.moveTo(currentX, 0);
        ctx.lineTo(currentX, canvasHeight);
        ctx.stroke();

        ctx.fillText(`S${server}`, currentX - (stepX + 15) / 2, canvas.height - 10);
    }

    for (let hacker = 0; hacker < m; hacker++) {
        let prevX = 0;
        let prevY = canvas.height;
        const color = getRandomColor();

        for (let server = 1; server <= n; server++) {
            const currentX = server * stepX;
            let currentY = prevY;

            const attackSuccess = Math.random() < p;
            if (attackSuccess) {
                successCounts[hacker]++;
                currentY -= stepY * 0.5;
            }

            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(currentX, currentY);
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();

            prevX = currentX;
            prevY = currentY;
        }

        // Aggiungi hacker alla legenda
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `<div style="background-color: ${color};"></div> Hacker ${hacker + 1}`;
        legendContainer.appendChild(legendItem);
    }

    drawHistogram(successCounts, n, m);

    // Calcolo del valore medio di successo per server
    const avgSuccess = successCounts.reduce((a, b) => a + b, 0) / m;
    const avgHeight = (avgSuccess / n) * canvasHeight;
    const avgYPosition = canvasHeight - (avgHeight * (m + 1)) / m;

    // Aggiungi valore medio alla pagina
    const meanValue = document.getElementById("averageMean");
    meanValue.textContent = avgSuccess.toFixed(2);
}

document.getElementById('updateBtn').onclick = function() {
    const n = parseInt(document.getElementById('numServers').value);
    const m = parseInt(document.getElementById('numHackers').value);
    const p = parseFloat(document.getElementById('probability').value);

    drawAttackSimulation(n, m, p);
};

document.getElementById('updateBtn').click();