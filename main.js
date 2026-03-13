/* =============================================
   NeonPlay — main.js
   Dynamic video cards, stats, scroll reveals
   ============================================= */

// ─────────────────────────────────────────────
// CONFIG — edit these to personalise your site
// ─────────────────────────────────────────────
const CONFIG = {
  channelName: "Notdipesh0",
  youtubeChannelUrl: "https://www.youtube.com/@Notdipesh0",
  youtubeChannelId: "UCOIZBwJjo208LaT4EUd9yUw",
  youtubeApiKey: "AIzaSyDjcGWH94XupVfkwdKKJl6E4LmcSOtFjHc",

  // Placeholder stats (shown until API loads or if no API key)
  stats: {
    subscribers: "12.4K",
    videos: "87",
    views: "1.2M",
  },

  // Featured / latest video IDs — replace these with your actual YouTube video IDs
  // Find the ID in the YouTube URL: youtube.com/watch?v=VIDEO_ID
  videos: [
    {
      id: "dQw4w9WgXcQ",
      title: "I Tried the HARDEST Level in This Game... Here's What Happened",
      views: "48K views",
      date: "2 days ago",
      duration: "18:32",
    },
    {
      id: "9bZkp7q19f0",
      title: "Playing With Subscribers Until Someone Wins $100 | Epic Moments!",
      views: "31K views",
      date: "1 week ago",
      duration: "24:11",
    },
    {
      id: "jNQXAC9IVRw",
      title: "The Most BROKEN Character in the Game Right Now (Insane Stats)",
      views: "22K views",
      date: "2 weeks ago",
      duration: "12:47",
    },
    {
      id: "M7lc1UVf-VE",
      title: "I Speedran This Game as a Noob... (World Record Attempt)",
      views: "19K views",
      date: "3 weeks ago",
      duration: "31:05",
    },
    {
      id: "kJQP7kiw5Fk",
      title: "Rating EVERY Weapon in the Game Tier List (S to F Tier)",
      views: "15K views",
      date: "1 month ago",
      duration: "16:22",
    },
    {
      id: "CevxZvSJLk8",
      title: "Solo vs Squad — Can One Player Beat an Entire Team?",
      views: "11K views",
      date: "1 month ago",
      duration: "21:58",
    },
  ],
};

// ─────────────────────────────────────────────
// HAMBURGER MENU
// ─────────────────────────────────────────────
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");

hamburger.addEventListener("click", () => {
  mobileMenu.classList.toggle("open");
});

function closeMobile() {
  mobileMenu.classList.remove("open");
}

// Close menu on outside click
document.addEventListener("click", (e) => {
  if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
    mobileMenu.classList.remove("open");
  }
});

// ─────────────────────────────────────────────
// LIVE STAT COUNTER (YouTube API)
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

async function loadStats() {
  const subEl = document.getElementById("subCount");
  const vidEl = document.getElementById("vidCount");
  const viewEl = document.getElementById("viewCount");

  subEl.textContent = "...";
  vidEl.textContent = "...";
  viewEl.textContent = "...";

  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics,contentDetails&id=${CONFIG.youtubeChannelId}&key=${CONFIG.youtubeApiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.items || data.items.length === 0) throw new Error("No channel data");

    const stats = data.items[0].statistics;
    animateToNumber(subEl, parseInt(stats.subscriberCount || 0));
    animateToNumber(vidEl, parseInt(stats.videoCount || 0));
    animateToNumber(viewEl, parseInt(stats.viewCount || 0));

  } catch (err) {
    console.warn("Could not fetch live stats:", err);
    subEl.textContent = CONFIG.stats.subscribers;
    vidEl.textContent = CONFIG.stats.videos;
    viewEl.textContent = CONFIG.stats.views;
  }
}

// ─────────────────────────────────────────────
// RELATIVE TIME HELPER
// ─────────────────────────────────────────────
function relativeTime(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
  return `${Math.floor(diff / 31536000)} years ago`;
}

// ─────────────────────────────────────────────
// RENDER VIDEO CARDS (from live or fallback data)
// ─────────────────────────────────────────────
function renderVideoCards(videos) {
  const grid = document.getElementById("videosGrid");
  if (!grid) return;
  grid.innerHTML = "";

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
        <img src="${thumb}" alt="${vid.title}" loading="lazy" onerror="this.src='${fallback}'"/>
        <div class="video-play"><div class="play-btn">▶</div></div>
        ${vid.duration ? `<span class="video-duration">${vid.duration}</span>` : ""}
      </div>
      <div class="video-info">
        <h3>${vid.title}</h3>
        <div class="video-meta">
          <span class="video-views">📅 ${vid.date}</span>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

// ─────────────────────────────────────────────
// FETCH LIVE VIDEOS FROM YOUTUBE SEARCH API
// ─────────────────────────────────────────────
async function buildVideoCards() {
  const grid = document.getElementById("videosGrid");

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
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${CONFIG.youtubeApiKey}&channelId=${CONFIG.youtubeChannelId}&part=snippet&order=date&maxResults=6&type=video`;
    const res = await fetch(searchUrl);
    const data = await res.json();

    if (!data.items || data.items.length === 0) throw new Error("No videos found");

    const videos = data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      date: relativeTime(item.snippet.publishedAt),
      thumb: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      duration: "",
    }));

    renderVideoCards(videos);

  } catch (err) {
    console.warn("Could not fetch live videos, using fallback:", err);
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

// ─────────────────────────────────────────────
// ACTIVE NAV STYLE (injected)
// ─────────────────────────────────────────────
const style = document.createElement("style");
style.textContent = `.nav-links a.active { color: var(--yellow) !important; }`;
document.head.appendChild(style);
