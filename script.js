// script.js - Load real insights from data.json and display them

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('urlForm');
  const loadingEl = document.getElementById('loading');
  const reportEl = document.getElementById('report');

  const seoContent = document.getElementById('seoContent');
  const ppcContent = document.getElementById('ppcContent');
  const creativeContent = document.getElementById('creativeContent');
  const techContent = document.getElementById('techContent');
  const growthScoreEl = document.getElementById('growthScore');
  const improvementEl = document.getElementById('improvement');

  // Load insights data once
  let insightsData = null;
  fetch('data.json')
    .then((res) => res.json())
    .then((data) => {
      insightsData = data;
    })
    .catch((err) => {
      console.error('Failed to load insights data:', err);
    });

  const actions = {
    seo: "[👤 YRSK Expert Action]: Our content team will create high‑authority articles targeting the missing keywords.",
    ppc: "[👤 YRSK Expert Action]: Reallocate budget from low‑ROI platforms to high‑ROI LinkedIn campaigns.",
    creative: "[👤 YRSK Expert Action]: Produce a 30‑second 3D video showcasing your secure banking platform.",
    tech: "[👤 YRSK Expert Action]: Optimize images, enable compression, and improve mobile tap target sizes."
  };

  function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = document.getElementById('websiteUrl').value.trim();
    if (!url) return;

    // Show loading, hide previous report
    loadingEl.classList.remove('hidden');
    reportEl.classList.add('hidden');

    const statusLog = document.getElementById('statusLog');
    const steps = [
      "Initializing YRSK Nexus AI...",
      "Phase 1: Activating Performance & Ads Agent...",
      "Phase 2: Scanning SEO & Content Intelligence...",
      "Phase 3: Analyzing Creative Assets...",
      "Phase 4: Auditing UX & Tech Stack...",
      "Synthesizing Hybrid Growth Strategy..."
    ];

    let stepIndex = 0;
    statusLog.textContent = steps[0];

    // Start visual scanner loop
    const interval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        statusLog.textContent = steps[stepIndex];
      }
    }, 800);

    // Call Backend API
    fetch(`http://localhost:3000/analyze?url=${encodeURIComponent(url)}`)
      .then(res => res.json())
      .then(data => {
        clearInterval(interval);
        statusLog.textContent = "Analysis Complete.";

        if (data.error) {
          alert("Error: " + data.error);
          loadingEl.classList.add('hidden');
          return;
        }

        // Helper to create structured HTML
        const createHTML = (insight, action) => `
          <div class="insight-box">
            <span class="insight-label">🤖 AI Insight</span>
            <div class="insight-text">${insight || "Analysis pending..."}</div>
          </div>
          <div class="action-box">
            <span class="action-label">👤 YRSK Expert Action</span>
            <div class="action-text">${action || "Strategy formulation in progress..."}</div>
          </div>
        `;

        // Populate Report with Structured HTML
        seoContent.innerHTML = createHTML(data.seo[0], data.actions.seo);
        ppcContent.innerHTML = createHTML(data.ppc[0], data.actions.ppc);
        creativeContent.innerHTML = createHTML(data.creative[0], data.actions.creative);
        techContent.innerHTML = createHTML(data.tech[0], data.actions.tech);

        growthScoreEl.textContent = `Score: ${data.score}/100`;
        improvementEl.textContent = `Potential improvement: +${data.improvement} points with full implementation.`;

        loadingEl.classList.add('hidden');
        reportEl.classList.remove('hidden');
      })
      .catch(err => {
        clearInterval(interval);
        console.error(err);
        statusLog.textContent = "Connection Failed. Is the server running?";
        alert("Failed to connect to backend. Make sure 'node server.js' is running.");
        loadingEl.classList.add('hidden');
      });
  });
});
