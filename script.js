const apiKey = 'AIzaSyBXOnPb8MKxBE1pT6SYvdQdX_87350Nk9g';
let currentPlaylist = [];
let currentVideoIndex = 0;

async function loadPlaylists() {
  const response = await fetch('data.json');
  const playlists = await response.json();

  playlists.forEach(playlist => {
    const btn = document.createElement('button');
    btn.textContent = playlist.name;
    btn.onclick = () => loadPlaylist(playlist.id);
    document.getElementById('playlistControls').appendChild(btn);

    if (playlist.default) loadPlaylist(playlist.id);
  });
}

async function loadPlaylist(id) {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${id}&maxResults=50&key=${apiKey}`);
  if (!res.ok) {
    alert('Failed to load playlist');
    return;
  }
  const data = await res.json();
  currentPlaylist = data.items;
  currentVideoIndex = 0;
  renderPlaylistItems();
  loadVideo(currentVideoIndex);
}

function renderPlaylistItems() {
  const container = document.getElementById('playlistVideos');
  container.innerHTML = '';
  currentPlaylist.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'playlist-video';
    div.onclick = () => loadVideo(idx);
    div.innerHTML = `
      <img src="${item.snippet.thumbnails.default.url}">
      <span>${item.snippet.title}</span>
    `;
    container.appendChild(div);
  });
}

function loadVideo(index) {
  currentVideoIndex = index;
  const videoId = currentPlaylist[index].snippet.resourceId.videoId;
  document.getElementById('videoPlayer').src = `https://www.youtube-nocookie.com/embed/${videoId}?controls=1&autoplay=0`;
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
  const playlistPane = document.getElementById('playlistPane');
  const currentSize = parseFloat(window.getComputedStyle(playlistPane).fontSize);
  playlistPane.style.fontSize = `${currentSize + step}px`;
}

window.onload = loadPlaylists;
