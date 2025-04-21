let player;
let currentPlaylist = [];
let currentVideoIndex = 0;
const apiKey = 'AIzaSyAF0WI0zfh8wxf4Vzu4ucKPQBG8eTGrHbo'; // Replace with your real key

function onYouTubeIframeAPIReady() {
  player = new YT.Player('videoPlayer', {
    height: '100%',
    width: '100%',
    playerVars: {
      modestbranding: 1,
      rel: 0,
      controls: 1,
      autoplay: 0,
    },
    events: {
      onReady: loadPlaylists
    }
  });
}

async function loadPlaylists() {
  const response = await fetch('data.json');
  const playlists = await response.json();
  const container = document.getElementById('playlistControls');

  const row = document.createElement('div');
  row.id = 'playlistButtons';
  row.style.display = 'flex';

  playlists.forEach((pl, index) => {
    const btn = document.createElement('button');
    btn.textContent = pl.name;
    btn.onclick = () => loadPlaylist(pl.id);
    row.appendChild(btn);
    if (pl.default) loadPlaylist(pl.id);
  });

  container.appendChild(row);
}

async function loadPlaylist(playlistId) {
  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${apiKey}`);
    const data = await response.json();

    if (!data.items) throw new Error(data.error.message || 'No videos returned');

    currentPlaylist = data.items;
    currentVideoIndex = 0;
    renderPlaylistItems();
    loadVideo(currentVideoIndex);
  } catch (error) {
    console.error('Failed to load playlist:', error);
    document.getElementById('playlistVideos').innerHTML = '<p style="color:red;">Playlist failed to load.</p>';
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
      <img src="${thumb}" alt="${title}">
      <span>${title}</span>
    `;
    div.onclick = () => loadVideo(index);
    container.appendChild(div);
  });
}

function loadVideo(index) {
  currentVideoIndex = index;
  const videoId = currentPlaylist[index].snippet.resourceId.videoId;
  player.loadVideoById(videoId);
}

function previousVideo() {
  if (currentVideoIndex > 0) {
    currentVideoIndex--;
    loadVideo(currentVideoIndex);
  }
}

function nextVideo() {
  if (currentVideoIndex < currentPlaylist.length - 1) {
    currentVideoIndex++;
    loadVideo(currentVideoIndex);
  }
}

function togglePlayPause() {
  if (!player) return;

  const state = player.getPlayerState();
  if (state === YT.PlayerState.PLAYING) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}

function adjustFontSize(step) {
  const pane = document.getElementById('playlistPane');
  const size = parseFloat(window.getComputedStyle(pane).fontSize);
  pane.style.fontSize = `${size + step}px`;
}
function fullReload() {
  window.location.replace(window.location.href);
}
