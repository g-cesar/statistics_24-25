// Support function to generate a random RGB color
function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r},${g},${b})`;
}

// Support function to calculate the sum recursively
function recursiveSum(array, index = 0) {
    // Condizione di terminazione: se l'indice è uguale alla lunghezza dell'array, ritorna 0
    if (index === array.length) {
        return 0;
    }
    // Somma l'elemento corrente e chiama ricorsivamente la funzione per il successivo
    return array[index] + recursiveSum(array, index + 1);
}


// The following function draws a 700x500 canvas to represent
// the final histogram based on the success levels achieved by the hackers
function drawHistogram(successCounts, n, m) {
    const canvas = document.getElementById('probabilityCanvas');
    const ctx = canvas.getContext('2d');

    const canvasWidth = 700;
    const canvasHeight = 500;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // The array containing success levels is initialized based on the success values of each hacker
    const levelCounts = new Array(n + 1).fill(0);
    successCounts.forEach(count => {
        if (count <= n) {
            levelCounts[count]++;
        }
    });

    // The following parameters normalize the size of the bars
    // that make up the histogram to fit the canvas dimensions and the total number of levels
    // (and therefore servers)
    const barWidth = canvasWidth / (n + 1);
    const maxHeight = Math.max(...levelCounts) * 1.1;
    const histogramColor = getRandomColor();

    // For each server, the height of the histogram bar is set based on
    // the number of hackers that managed to breach it, and a small label with the server number
    // is shown, and on each bar, the number of hackers that breached it (unless the number is zero)
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

// The following function simulates and draws the graph of each hacker's attacks
// on a canvas of the same size as the histogram
// and takes the simulation parameters set by the user as input
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

    // Variable to dynamically generate the legend with colors for each hacker
    const legendContainer = document.getElementById('legend');
    legendContainer.innerHTML = '';

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;

    // The following loop draws the vertical lines for each server
    // and inserts a label with the server number at the bottom of the canvas
    for (let server = 1; server <= n; server++) {
        const currentX = server * stepX;
        ctx.beginPath();
        ctx.moveTo(currentX, 0);
        ctx.lineTo(currentX, canvasHeight);
        ctx.stroke();

        ctx.fillText(`S${server}`, currentX - (stepX + 15) / 2, canvas.height - 10);
    }

    // The following loop draws the lines representing each hacker's attacks on the servers
    // At each step of the loop, each hacker traverses one server after the other.
    // If their attack is successful (Math.random() < p) then the line jumps (normalized in the code for visualization purposes),
    // otherwise it remains at the same Y-coordinate value
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

        // The following code block adds the current hacker in the loop to the legend with its randomly generated color
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `<div style="background-color: ${color};"></div> Hacker ${hacker + 1}`;
        legendContainer.appendChild(legendItem);
    }

    // The function to draw the histogram is called
    drawHistogram(successCounts, n, m);

    // The average success value for each server is calculated using a recursive function
    // (indicating the average number of servers breached by the hackers)
    const avgSuccess = recursiveSum(successCounts) / m;

    // The calculated average is added to the page in order to be shown
    const meanValue = document.getElementById("averageMean");
    meanValue.textContent = avgSuccess.toFixed(2);
}

// The values of the parameters chosen by the user are retrieved
document.getElementById('updateBtn').onclick = function() {
    const n = parseInt(document.getElementById('numServers').value);
    const m = parseInt(document.getElementById('numHackers').value);
    const p = parseFloat(document.getElementById('probability').value);

    // The function is called to start the simulation
    drawAttackSimulation(n, m, p);
};

// This line of code allows the simulation to start on load
document.getElementById('updateBtn').click();