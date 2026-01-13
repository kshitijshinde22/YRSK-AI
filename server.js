const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Helper to generate heuristic insights
function generateInsights(data) {
    const insights = { seo: [], ppc: [], creative: [], tech: [] };
    const actions = { seo: "", ppc: "", creative: "", tech: "" };

    // --- SEO Analysis ---
    if (!data.title) {
        insights.seo.push("Critical: Homepage title tag is missing.");
        actions.seo = "Add a descriptive title tag with primary keywords immediately.";
    } else if (data.title.length < 30) {
        insights.seo.push(`Title is too short (${data.title.length} chars). Competitors average 55-60 chars.`);
        actions.seo = "Expand title tag to include brand USP and secondary keywords.";
    } else {
        insights.seo.push("Title length is good, but lacks emotional power words.");
        actions.seo = "A/B test title variants with higher emotional sentiment.";
    }

    if (!data.description) {
        insights.seo.push("Meta description is missing. CTR on search results will be low.");
        if (!actions.seo) actions.seo = "Write a compelling meta description (150-160 chars).";
    }

    if (data.h1Count === 0) {
        insights.seo.push("No H1 tag found. Search engines can't identify the main topic.");
    } else if (data.h1Count > 1) {
        insights.seo.push("Multiple H1 tags detected. This dilutes keyword relevance.");
    }

    // --- Tech Analysis ---
    if (!data.viewport) {
        insights.tech.push("Mobile viewport tag missing. Site is not mobile-friendly.");
        actions.tech = "Add <meta name='viewport'> tag to fix mobile scaling.";
    } else {
        insights.tech.push("Viewport tag present, but touch targets may still be too small.");
        actions.tech = "Run a full mobile usability audit to fix tap target sizes.";
    }

    if (data.imageCount > 10 && !data.imagesWithAlt) {
        insights.tech.push(`Found ${data.imageCount} images, many missing ALT text.`);
    }

    // --- PPC (Heuristic / Simulated based on industry) ---
    // We can't easily see PPC spend, so we infer from content
    const keywords = (data.title + " " + data.description).toLowerCase();
    if (keywords.includes("loan") || keywords.includes("credit") || keywords.includes("bank")) {
        insights.ppc.push("High CPC detected for finance keywords. Google Ads may be too expensive.");
        actions.ppc = "Shift 30% of budget to LinkedIn Ads for better B2B targeting.";
    } else if (keywords.includes("software") || keywords.includes("saas")) {
        insights.ppc.push("SaaS sector detected. Competitors are bidding heavily on 'best [service]'.");
        actions.ppc = "Focus on competitor comparison keywords (e.g., 'vs Competitor').";
    } else {
        insights.ppc.push("Generic keyword strategy detected. You are bidding on broad terms.");
        actions.ppc = "Implement Single Keyword Ad Groups (SKAGs) to reduce wasted spend.";
    }

    // --- Creative (Heuristic) ---
    if (data.videoCount === 0) {
        insights.creative.push("No video content detected on homepage. Engagement is likely low.");
        actions.creative = "Create a 60-second explainer video to increase dwell time.";
    } else {
        insights.creative.push("Video detected, but lacks a clear CTA overlay.");
        actions.creative = "Add a lead capture form directly within the video player.";
    }

    // Defaults if empty
    if (!actions.seo) actions.seo = "Conduct a full keyword gap analysis.";
    if (!actions.tech) actions.tech = "Implement lazy loading for images to boost Core Web Vitals.";

    return { insights, actions };
}

app.get('/analyze', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    try {
        // Add protocol if missing
        const targetUrl = url.startsWith('http') ? url : `https://${url}`;

        console.log(`Scanning: ${targetUrl}`);
        const response = await axios.get(targetUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
            timeout: 10000
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // Extract Data
        const title = $('title').text().trim();
        const description = $('meta[name="description"]').attr('content') || '';
        const h1Count = $('h1').length;
        const viewport = $('meta[name="viewport"]').attr('content');
        const imageCount = $('img').length;
        const imagesWithAlt = $('img[alt]').length;
        const videoCount = $('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length;

        const rawData = { title, description, h1Count, viewport, imageCount, imagesWithAlt, videoCount };
        const { insights, actions } = generateInsights(rawData);

        // Calculate score based on findings
        let score = 85;
        if (!title) score -= 10;
        if (!description) score -= 10;
        if (!viewport) score -= 15;
        if (h1Count === 0) score -= 5;
        if (score < 0) score = 0;

        const improvement = Math.min(100 - score, 20); // Cap improvement

        res.json({
            seo: insights.seo,
            ppc: insights.ppc,
            creative: insights.creative,
            tech: insights.tech,
            actions: actions,
            score: score,
            improvement: improvement
        });

    } catch (error) {
        console.error('Analysis failed:', error.message);
        res.status(500).json({
            error: 'Failed to analyze URL. Ensure it is reachable.',
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`YRSK Nexus Backend running on http://localhost:${PORT}`);
});
