let player;
let currentPlaylist = [];
let currentVideoIndex = 0;
const apiKey = 'YOUR_API_KEY'; // Replace with your actual key

// YouTube API loader
function onYouTubeIframeAPIReady() {
  player = new YT.Player('videoPlayer', {
    height: '100%',
    width: '100%',
    playerVars: {
      modestbranding: 1,
      rel: 0,
      autoplay: 0,
      controls: 1,
      enablejsapi: 1,
    },
    events: {
      onReady: () => loadPlaylists()
    }
  });
}

// Load playlist metadata from JSON
async function loadPlaylists() {
  const response = await fetch('data.json');
  const playlists = await response.json();
  const container = document.getElementById('playlistControls');

  const buttonRow = document.createElement('div');
  buttonRow.classList.add('playlist-button-row');
  buttonRow.id = 'playlistButtons';

  playlists.forEach((pl) => {
    const btn = document.createElement('button');
    btn.textContent = pl.name;
    btn.onclick = () => loadPlaylist(pl.id);
    buttonRow.appendChild(btn);
    if (pl.default) loadPlaylist(pl.id);
  });

  container.appendChild(buttonRow);
}

// Fetch videos from YouTube playlist
async function loadPlaylist(playlistId) {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`
    );
    const data = await res.json();

    if (!data.items) throw new Error(data.error.message || 'No videos found');

    currentPlaylist = data.items;
    currentVideoIndex = 0;
    renderPlaylistItems();
    loadVideo(currentVideoIndex);
  } catch (err) {
    console.error('Failed to load playlist:', err);
    document.getElementById('playlistVideos').innerHTML =
      '<p style="color:red;">Failed to load playlist.</p>';
  }
}

// Display videos in the playlist browser
function renderPlaylistItems() {
  const container = document.getElementById('playlistVideos');
  container.innerHTML = '';

  currentPlaylist.forEach((item, index) => {
    const videoId = item.snippet.resourceId.videoId;
    const title = item.snippet.title;
    const thumb = item.snippet.thumbnails.default.url;

    const div = document.createElement('div');
    div.className = 'playlist-video';
    div.innerHTML = `
      <img src="${thumb}" alt="${title}" />
      <span>${title}</span>
    `;
    div.onclick = () => loadVideo(index);
    container.appendChild(div);
  });
}

// Load video by index
function loadVideo(index) {
  currentVideoIndex = index;
  const videoId = currentPlaylist[index].snippet.resourceId.videoId;
  player.loadVideoById(videoId);
}

// Video control buttons
function previousVideo() {
  if (currentVideoIndex > 0) {
    loadVideo(--currentVideoIndex);
  }
}

function nextVideo() {
  if (currentVideoIndex < currentPlaylist.length - 1) {
    loadVideo(++currentVideoIndex);
  }
}

function togglePlayPause() {
  const state = player.getPlayerState();
  if (state === YT.PlayerState.PLAYING) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}

// Text sizing
function adjustFontSize(step) {
  const el = document.getElementById('playlistPane');
  const current = parseFloat(getComputedStyle(el).fontSize);
  el.style.fontSize = `${current + step}px`;
}

// Auto-init is handled by YouTube API's global callback
