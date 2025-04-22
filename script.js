let player;
let currentPlaylist = [];
let currentVideoIndex = 0;
let isPlayerReady = false;

const apiKey = 'AIzaSyAF0WI0zfh8wxf4Vzu4ucKPQBG8eTGrHbo'; // Replace with your actual YouTube API key

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
      onReady: () => {
        isPlayerReady = true;
        loadPlaylists();
      }
    }
  });
}

async function loadPlaylists() {
  const response = await fetch('data.json');
  const playlists = await response.json();
  const container = document.getElementById('playlistButtons');

let currentPlaylistId = null;

playlists.forEach(pl => {
  const btn = document.createElement('button');
  btn.textContent = pl.name;
  btn.onclick = () => {
    if (currentPlaylistId !== pl.id) {
      currentPlaylistId = pl.id;
      loadPlaylist(pl.id);
    }
  };
  container.appendChild(btn);

  if (pl.default && currentPlaylistId === null) {
    currentPlaylistId = pl.id;
    loadPlaylist(pl.id);
  }
});

}

;

async function fetchVideoDurations(videoIds) {
  const ids = videoIds.join(',');
  const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids}&key=${apiKey}`);
  const data = await response.json();
  const durations = {};
  data.items.forEach(video => {
    durations[video.id] = formatDuration(video.contentDetails.duration);
  });
  return durations;
}

function formatDuration(iso) {
  const match = iso.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const h = parseInt(match[1]) || 0;
  const m = parseInt(match[2]) || 0;
  const s = parseInt(match[3]) || 0;

  const totalSec = h * 3600 + m * 60 + s;
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function loadPlaylist(playlistId) {
  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${apiKey}`);
    const data = await response.json();

    if (!data.items) throw new Error(data.error?.message || 'No videos returned');

    currentPlaylist = data.items;
    currentVideoIndex = 0;
    renderPlaylistItems();
    cueVideo(currentVideoIndex);
  } catch (error) {
    console.error('Failed to load playlist:', error);
    document.getElementById('playlistVideos').innerHTML = '<p style="color:red;">Playlist failed to load.</p>';
  }
}

async function renderPlaylistItems() {
  const container = document.getElementById('playlistVideos');
  container.innerHTML = '';

  const videoIds = currentPlaylist.map(item => item.snippet.resourceId.videoId);
  const durations = await fetchVideoDurations(videoIds);

currentPlaylist.forEach((item, index) => {
  const videoId = item.snippet.resourceId.videoId;
  const title = item.snippet.title;
  const thumb = item.snippet.thumbnails.medium.url;
  const duration = durations[videoId] || '';

  const div = document.createElement('div');
  div.className = 'playlist-video';
  if (index === currentVideoIndex) {
    div.classList.add('now-playing');
  }

  div.innerHTML = `
    <img src="${thumb}" alt="${title}" style="width: 120px;">
    <div class="video-info">
  <div class="video-title">${title}</div>
  <div class="video-duration">${duration}</div>
</div>


    </div>
  `;
  div.onclick = () => loadVideo(index);
  container.appendChild(div);
});

}


function loadVideo(index) {
  currentVideoIndex = index;
  const videoId = currentPlaylist[index].snippet.resourceId.videoId;
  if (isPlayerReady && player && player.loadVideoById) {
    player.loadVideoById(videoId);
    renderPlaylistItems();
  } else {
    setTimeout(() => loadVideo(index), 200);
  }
}


function cueVideo(index) {
  currentVideoIndex = index;
  const videoId = currentPlaylist[index].snippet.resourceId.videoId;
  if (isPlayerReady && player && player.cueVideoById) {
    player.cueVideoById(videoId);
    renderPlaylistItems();
  } else {
    setTimeout(() => cueVideo(index), 200);
  }
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
  if (!player || !isPlayerReady) return;
  const button = document.querySelector('.playback-controls button[data-action="toggle"]');
  const state = player.getPlayerState();

  if (state === YT.PlayerState.PLAYING) {
    player.pauseVideo();
    button.innerHTML = '▶<br><span class="icon-label">Play</span>';
  } else {
    player.playVideo();
    button.innerHTML = '❚❚<br><span class="icon-label">Pause</span>';
  }
}


function adjustFontSize(step) {
  const pane = document.getElementById('playlistPane');
  const size = parseFloat(window.getComputedStyle(pane).fontSize);
  const newSize = Math.min(Math.max(size + step, 12), 24);
  pane.style.fontSize = `${newSize}px`;
}

function resetKiosk() {
  // Clear existing UI
  document.getElementById('playlistButtons').innerHTML = '';
  document.getElementById('playlistVideos').innerHTML = '';
  document.getElementById('playlistPane').style.fontSize = '16px';

  // Reload playlists
  loadPlaylists();
}

document.addEventListener('DOMContentLoaded', () => {
  const incBtn = document.getElementById('fontInc');
  const decBtn = document.getElementById('fontDec');

  if (incBtn) incBtn.addEventListener('click', () => adjustFontSize(2));
  if (decBtn) decBtn.addEventListener('click', () => adjustFontSize(-2));
});
