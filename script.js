const apiKey = 'AIzaSyAF0WI0zfh8wxf4Vzu4ucKPQBG8eTGrHbo'; // Replace with your restricted API key
let currentPlaylist = [];
let currentVideoIndex = 0;

async function loadPlaylists() {
  const response = await fetch('data.json');
  const playlists = await response.json();
  const container = document.getElementById('playlistButtons');

  playlists.forEach((pl, index) => {
    const btn = document.createElement('button');
    btn.textContent = pl.name;
    btn.onclick = () => loadPlaylist(pl.id);
    container.appendChild(btn);
    if (pl.default) loadPlaylist(pl.id);
  });
}

async function loadPlaylist(playlistId) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`
    );
    const data = await response.json();

    if (!data.items) throw new Error(data.error.message || 'No videos found');

    currentPlaylist = data.items;
    currentVideoIndex = 0;
    renderPlaylistItems();
    loadVideo(currentVideoIndex);
  } catch (err) {
    console.error('Failed to load playlist:', err);
    document.getElementById('playlistVideos').innerHTML =
      '<p style="color:red;">Failed to load playlist. Check console for details.</p>';
  }
}

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

function loadVideo(index) {
  currentVideoIndex = index;
  const videoId = currentPlaylist[index].snippet.resourceId.videoId;
  document.getElementById('videoPlayer').src =
    `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&controls=1&modestbranding=1`;
}

function previousVideo() {
  if (currentVideoIndex > 0) loadVideo(--currentVideoIndex);
}

function nextVideo() {
  if (currentVideoIndex < currentPlaylist.length - 1) loadVideo(++currentVideoIndex);
}

function togglePlayPause() {
  const iframe = document.getElementById('videoPlayer');
  iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
}

function adjustFontSize(step) {
  const el = document.getElementById('playlistPane');
  const current = parseFloat(getComputedStyle(el).fontSize);
  el.style.fontSize = `${current + step}px`;
}

window.onload = loadPlaylists;
