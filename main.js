/* =============================================
   Notdipesh0 — main.js
   Live YouTube stats, videos, scroll reveals
   ============================================= */

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const CONFIG = {
  channelName: "Notdipesh0",
  youtubeChannelUrl: "https://www.youtube.com/@Notdipesh0",
  youtubeChannelId: "UCOIZBwJjo208LaT4EUd9yUw",
  youtubeApiKey: "AIzaSyDjcGWH94XupVfkwdKKJl6E4LmcSOtFjHc",
  stats: {
    subscribers: "---",
    videos: "---",
    views: "---",
  },
  videos: [],
};

// ─────────────────────────────────────────────
// HAMBURGER MENU
// ─────────────────────────────────────────────
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");

if (hamburger && mobileMenu) {
  hamburger.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
  });
}

function closeMobile() {
  mobileMenu?.classList.remove("open");
}

document.addEventListener("click", (e) => {
  if (hamburger && mobileMenu) {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.remove("open");
    }
  }
});

// ─────────────────────────────────────────────
// NUMBER FORMATTER + ANIMATOR
// ─────────────────────────────────────────────
function formatLiveNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function animateToNumber(el, num) {
  const start = performance.now();
  const duration = 1800;
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(num * eased);
    el.textContent = formatLiveNumber(current);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ─────────────────────────────────────────────
// LIVE CHANNEL STATS (YouTube Data API v3)
// ─────────────────────────────────────────────
async function loadStats() {
  const subEl = document.getElementById("subCount");
  const vidEl = document.getElementById("vidCount");
  const viewEl = document.getElementById("viewCount");

  if (!subEl || !vidEl || !viewEl) return;

  subEl.textContent = "...";
  vidEl.textContent = "...";
  viewEl.textContent = "...";

  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CONFIG.youtubeChannelId}&key=${CONFIG.youtubeApiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.items?.length) throw new Error("No channel data");

    const stats = data.items[0].statistics;
    animateToNumber(subEl, parseInt(stats.subscriberCount || 0));
    animateToNumber(vidEl, parseInt(stats.videoCount || 0));
    animateToNumber(viewEl, parseInt(stats.viewCount || 0));

  } catch (err) {
    console.warn("Stats fetch failed:", err);
    subEl.textContent = CONFIG.stats.subscribers;
    vidEl.textContent = CONFIG.stats.videos;
    viewEl.textContent = CONFIG.stats.views;
  }
}

// ─────────────────────────────────────────────
// RELATIVE TIME HELPER
// ─────────────────────────────────────────────
function relativeTime(dateStr) {
  const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
  return `${Math.floor(diff / 31536000)} years ago`;
}

// ─────────────────────────────────────────────
// RENDER VIDEO CARDS
// ─────────────────────────────────────────────
function renderVideoCards(videos) {
  const grid = document.getElementById("videosGrid");
  if (!grid) return;
  grid.innerHTML = "";

  if (videos.length === 0) {
    grid.innerHTML = `<p style="color:rgba(255,255,255,0.4);text-align:center;grid-column:1/-1;padding:40px;">No videos found.</p>`;
    return;
  }

  videos.forEach((vid, i) => {
    const thumb = vid.thumb || `https://img.youtube.com/vi/${vid.id}/maxresdefault.jpg`;
    const fallback = `https://img.youtube.com/vi/${vid.id}/hqdefault.jpg`;
    const url = `https://www.youtube.com/watch?v=${vid.id}`;

    const card = document.createElement("a");
    card.href = url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.className = "video-card reveal";
    card.style.transitionDelay = `${i * 80}ms`;

    card.innerHTML = `
      <div class="video-thumb">
        <img src="${thumb}" loading="lazy" onerror="this.src='${fallback}'"/>
        <div class="video-play"><div class="play-btn">▶</div></div>
        ${vid.duration ? `<span class="video-duration">${vid.duration}</span>` : ""}
      </div>
      <div class="video-info">
        <h3>${vid.title}</h3>
        <div class="video-meta">
          ${vid.views ? `<span>👁 ${vid.views}</span>` : ""}
          <span>📅 ${vid.date}</span>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

// ─────────────────────────────────────────────
// LIVE LATEST VIDEOS (YouTube Data API v3)
// ─────────────────────────────────────────────
async function buildVideoCards() {
  const grid = document.getElementById("videosGrid");
  if (!grid) return;

  // Loading skeleton
  grid.innerHTML = Array(6).fill(`
    <div class="video-card" style="pointer-events:none;">
      <div class="video-thumb" style="background:rgba(255,255,255,0.05);aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:2rem;opacity:0.3;">⏳</span>
      </div>
      <div class="video-info">
        <div style="height:14px;background:rgba(255,255,255,0.07);border-radius:6px;margin-bottom:10px;"></div>
        <div style="height:14px;background:rgba(255,255,255,0.04);border-radius:6px;width:60%;"></div>
      </div>
    </div>
  `).join("");

  try {
    // Step 1: Get latest 6 video IDs + snippets
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${CONFIG.youtubeApiKey}&channelId=${CONFIG.youtubeChannelId}&part=snippet&order=date&maxResults=6&type=video`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.items?.length) throw new Error("No videos found");

    // Step 2: Get view counts for those videos
    const ids = searchData.items.map((v) => v.id.videoId).join(",");
    const statsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?key=${CONFIG.youtubeApiKey}&part=statistics&id=${ids}`);
    const statsData = await statsRes.json();

    const statsMap = {};
    statsData.items?.forEach((item) => {
      statsMap[item.id] = item.statistics;
    });

    const videos = searchData.items.map((item) => {
      const videoId = item.id.videoId;
      const views = parseInt(statsMap[videoId]?.viewCount || 0);
      return {
        id: videoId,
        title: item.snippet.title,
        date: relativeTime(item.snippet.publishedAt),
        thumb: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        views: formatLiveNumber(views) + " views",
        duration: "",
      };
    });

    renderVideoCards(videos);

  } catch (err) {
    console.warn("Videos fetch failed:", err);
    renderVideoCards(CONFIG.videos);
  }
}

// ─────────────────────────────────────────────
// SCROLL REVEAL
// ─────────────────────────────────────────────
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

function initReveal() {
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

// ─────────────────────────────────────────────
// ACTIVE NAV LINK ON SCROLL
// ─────────────────────────────────────────────
function initActiveNav() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");

  const scrollObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((a) => a.classList.remove("active"));
          const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
          if (active) active.classList.add("active");
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );

  sections.forEach((s) => scrollObs.observe(s));
}

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  buildVideoCards();
  loadStats();
  initReveal();
  initActiveNav();
});

// Active nav highlight style
const style = document.createElement("style");
style.textContent = `.nav-links a.active { color: var(--yellow) !important; }`;
document.head.appendChild(style);
