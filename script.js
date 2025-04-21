const playlists = [
  { id: "PLRdkgOpCgKLCHW0LepxgvtZhCPAKpA_ph", title: "Barre" },
  { id: "PLRdkgOpCgKLAMNCxMO2C1_UqUJWOxhfFG", title: "Full Body" },
  { id: "PLRdkgOpCgKLDpQ0yMrjs_UG0YgYkR7vKl", title: "Cardio HIIT" }
];

let currentPlaylist = playlists[0];
let player;
let currentVideoIndex = 0;

function loadYouTubeAPI() {
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
}

function onYouTubeIframeAPIReady() {
  player = new YT.Player('playerPane', {
    height: '100%',
    width: '100%',
    videoId: '',
    playerVars: {
      autoplay: 0,
      modestbranding: 1
    },
    events: {
      'onReady': loadPlaylist
    }
  });
}

async function loadPlaylist(playlistId) {
  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${apiKey}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    renderPlaylistItems(data.items || []);
  } catch (error) {
    console.error("Playlist load error:", error);
    // Optional: display a user-friendly message
  }
}

function renderPlaylistItems(items) {
  const playlistPane = document.getElementById('playlistPane');
  playlistPane.innerHTML = '';  // Clear existing items

  if (!items.length) {
    playlistPane.innerHTML = '<p>No videos found.</p>';
    return;
  }

  items.forEach(item => {
    const videoId = item.snippet.resourceId.videoId;
    const title = item.snippet.title;
    const thumbnailUrl = item.snippet.thumbnails.default.url;

    const div = document.createElement('div');
    div.className = 'playlist-video';
    div.innerHTML = `
      <img src="${thumbnailUrl}" alt="${title}">
      <span>${title}</span>
    `;
    div.onclick = () => loadVideo(videoId);
    playlistPane.appendChild(div);
  });

  // Ensure playback controls stay anchored
  const controls = document.createElement('div');
  controls.className = 'playback-controls';
  controls.innerHTML = `
    <button onclick="previousVideo()">⏮ Previous</button>
    <button onclick="togglePlayPause()">⏯ Play/Pause</button>
    <button onclick="nextVideo()">⏭ Next</button>
  `;
  playlistPane.appendChild(controls);
}


function renderPlaylistItems(items) {
  const playlistPane = document.getElementById('playlistPane');
  playlistPane.innerHTML = '';

  items.forEach((item, index) => {
    const videoElem = document.createElement('div');
    videoElem.className = 'playlist-video';
    videoElem.innerHTML = `
      <img src="${item.snippet.thumbnails.medium.url}">
      <div>${item.snippet.title}</div>`;
    videoElem.onclick = () => {
      currentVideoIndex = index;
      player.loadVideoById(item.snippet.resourceId.videoId);
    };
    playlistPane.appendChild(videoElem);
  });

  anchorPlaybackControls();
}

function anchorPlaybackControls() {
  const playbackControls = document.querySelector('.playback-controls');
  document.getElementById('playlistPane').appendChild(playbackControls);
}

function changePlaylist(index) {
  currentPlaylist = playlists[index];
  loadPlaylist();
}

// playback controls
function previousVideo() {
  if (currentVideoIndex > 0) {
    currentVideoIndex--;
    player.loadVideoById(player.getPlaylist()[currentVideoIndex]);
  }
}

function playPauseVideo() {
  if (player.getPlayerState() === YT.PlayerState.PLAYING) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}

function nextVideo() {
  currentVideoIndex++;
  player.nextVideo();
}

// font resizing
let currentFontSizeIndex = 1;
const fontSizes = ['14px', '16px', '18px', '20px', '22px'];

function adjustFontSize(direction) {
  currentFontSizeIndex = Math.max(0, Math.min(fontSizes.length - 1, currentFontSizeIndex + direction));
  document.getElementById('playlistPane').style.fontSize = fontSizes[currentFontSizeIndex];
}

function reloadPage() {
  location.reload();
}

// initialize
document.addEventListener('DOMContentLoaded', () => {
  loadYouTubeAPI();
});
