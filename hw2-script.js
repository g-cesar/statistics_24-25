document.getElementById('simulateBtn').addEventListener('click', () => {
  const n = parseInt(document.getElementById('n').value);
  const m = parseInt(document.getElementById('m').value);
  const p = parseFloat(document.getElementById('p').value);
  const t = parseInt(document.getElementById('t').value);
  const freqType = document.getElementById('freqType').value;

  // Generate m trajectories, each with n attempts
  const trajectories = [];
  const finalHeights = [];  // To store the final heights for distribution
  for (let i = 0; i < m; i++) {
    const trajectory = [0];  // Starting at 0
    for (let j = 1; j <= n; j++) {
      let step = Math.random() < p ? 1 : -1;
      if(freqType == "Relative"){
        trajectory.push((trajectory[j - 1] + step) / j);
      }else{
        trajectory.push(trajectory[j - 1] + step);
      }
      
    }
    trajectories.push(trajectory);
    finalHeights.push(trajectory[n]);  // Save the final height
    console.log(trajectories);
  }

  // --- Line Chart for Trajectories ---
  const labels = Array.from({ length: n + 1 }, (_, i) => i);
  const datasets = trajectories.map((trajectory, index) => ({
    label: `Trajectory ${index + 1}`,
    data: trajectory,
    fill: false,
    borderColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`,
    borderWidth: 2,
  }));

  // Create or update the line chart
  const ctx = document.getElementById('chartCanvas').getContext('2d');
  if (window.chart) {
    window.chart.destroy();
  }
  window.chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: datasets,
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Attempts (n)',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Level',
          },
        },
      },
    },
    plugins: [{
      afterDraw: function (chart) {
          const ctx = chart.ctx;
          const xAxis = chart.scales.x;

          // Draw vertical line at x-axis value 4
          const xValue = xAxis.getPixelForValue(t);
          ctx.save();
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.45)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(xValue, 0);
          ctx.lineTo(xValue, chart.height);
          ctx.stroke();
          ctx.restore();
      }
    }]
  });

// --- Probability Distribution Calculation ---
// Calculate frequencies of the final heights
const heightCounts = {};
finalHeights.forEach(height => {
  heightCounts[height] = (heightCounts[height] || 0) + 1;
});

 // Prepare data for the distribution chart at time T_max
let minHeight = -n;
let maxHeight = n;
let intervalCount = 2 * n + 1;
let step = 1;

if (freqType == "Relative") {
  minHeight = -0.5;
  maxHeight = 0.5;
  step = 0.01;
  intervalCount = Math.floor((maxHeight - minHeight) / step) + 1;
}

const distributionLabels = Array.from({ length: intervalCount }, (_, i) => (minHeight + i * step).toFixed(2));
const distributionData = new Array(intervalCount).fill(0);  // Start with 0 for all intervals

finalHeights.forEach(height => {
  const index = Math.floor((height - minHeight) / step);  // Map height to the correct index in the interval array
  if (index >= 0 && index < intervalCount) {
    distributionData[index] += 1;
  }
});

const distCtx = document.getElementById('distributionCanvas').getContext('2d');
if (window.distributionChart) {
  window.distributionChart.destroy();
}
window.distributionChart = new Chart(distCtx, {
  type: 'bar',
  data: {
    labels: distributionLabels,
    datasets: [{
      label: 'Frequency of Final Heights',
      data: distributionData,
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }],
  },
  options: {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Final Heights',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Frequency',
        },
      },
    },
  },
});

// --- Probability Distribution at Attempt n/2 ---

// Define the intermediate attempt index at time t
const midAttempt = t;

// Initialize distribution data for attempt n/2
const midHeightData = new Array(intervalCount).fill(0);  // Same interval count as final distribution

// Count frequencies for heights at attempt n/2, placing them in the correct interval
trajectories.forEach(trajectory => {
  const heightAtMid = trajectory[midAttempt];
  const index = Math.floor((heightAtMid - minHeight) / step);  // Map height to the correct index in the interval array
  if (index >= 0 && index < intervalCount) {
    midHeightData[index] += 1;
  }
});

// --- Bar Chart for Mid Attempt Distribution ---
const midDistCtx = document.getElementById('midDistributionCanvas').getContext('2d');
if (window.midDistributionChart) {
  window.midDistributionChart.destroy();
}
window.midDistributionChart = new Chart(midDistCtx, {
  type: 'bar',
  data: {
    labels: distributionLabels,
    datasets: [{
      label: `Frequency of Heights at Attempt ${midAttempt}`,
      data: midHeightData,
      backgroundColor: 'rgba(255, 159, 64, 0.5)',
      borderColor: 'rgba(255, 159, 64, 1)',
      borderWidth: 1,
    }],
  },
  options: {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Heights at Attempt n/2',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Frequency',
        },
      },
    },
  },
});

// --- Mean and Standard Deviation Calculation ---
// Calculate the mean and standard deviation of the final heights
const mean = finalHeights.reduce((sum, height) => sum + height, 0) / m;
const variance = finalHeights.reduce((sum, height) => sum + (height - mean) ** 2, 0) / m;
const stdDev = Math.sqrt(variance);

//Calculate the mean and standard deviation of the heights at attempt t
const midMean = trajectories.reduce((sum, trajectory) => sum + trajectory[midAttempt], 0) / m;
const midVariance = trajectories.reduce((sum, trajectory) => sum + (trajectory[midAttempt] - midMean) ** 2, 0) / m;
const midStdDev = Math.sqrt(midVariance);

// Display the mean and standard deviation
document.getElementById('mean').textContent = mean.toFixed(2);
document.getElementById('stdDev').textContent = stdDev.toFixed(2);
document.getElementById('midMean').textContent = midMean.toFixed(2);
document.getElementById('midStdDev').textContent = midStdDev.toFixed(2);

});