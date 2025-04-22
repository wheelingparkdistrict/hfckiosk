
let player;
let currentPlaylist = [];
let currentVideoIndex = 0;
let isPlayerReady = false;
let selectedPlaylistId = null;

const apiKey = 'AIzaSyAF0WI0zfh8wxf4Vzu4ucKPQBG8eTGrHbo';

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
  },
  onStateChange: onPlayerStateChange  // ✅ add this
}
    }
  );
}

async function loadPlaylists() {
  const response = await fetch('data.json');
  const playlists = await response.json();
  window.loadedPlaylists = playlists;
  const container = document.getElementById('playlistButtons');
  container.innerHTML = '';

  playlists.forEach(pl => {
    const btn = document.createElement('button');
    btn.textContent = pl.name;
    btn.onclick = () => {
      if (selectedPlaylistId !== pl.id) {
        selectedPlaylistId = pl.id;
            highlightSelectedPlaylistButton(pl.id); // ✅ NEW
        loadPlaylist(pl.id);
      }
    };
    container.appendChild(btn);
  });

  const defaultPl = playlists.find(p => p.default);
  if (defaultPl) {
    selectedPlaylistId = defaultPl.id;
    highlightSelectedPlaylistButton(defaultPl.id);
    loadPlaylist(defaultPl.id);
  }
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

async function loadPlaylist(playlistId) {
  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${apiKey}`);
    const data = await response.json();
    if (!data.items) throw new Error(data.error?.message || 'No videos returned');

currentPlaylist = data.items;
currentVideoIndex = 0;
renderPlaylistItems();            // ✅ renders sidebar
cueVideo(currentVideoIndex);      // ✅ updates player and highlights

    

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
    `;
    div.onclick = () => loadVideo(index);
    container.appendChild(div);
  });
}
function updateNavButtons() {
  const prev = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');

  if (prev) prev.disabled = (currentVideoIndex <= 0);
  if (next) next.disabled = (currentVideoIndex >= currentPlaylist.length - 1);
}

function updateNowPlayingHighlight() {
  const items = document.querySelectorAll('.playlist-video');
  items.forEach((el, index) => {
    el.classList.toggle('now-playing', index === currentVideoIndex);
  });
}

function loadVideo(index) {
  currentVideoIndex = index;
  const videoId = currentPlaylist[index].snippet.resourceId.videoId;
  if (isPlayerReady && player.cueVideoById) {
    player.cueVideoById(videoId);  // ✅ fixed
    updateNowPlayingHighlight();  // ✅ NEW
        updateNavButtons(); 
  }
}


function cueVideo(index) {
  currentVideoIndex = index;
  const videoId = currentPlaylist[index].snippet.resourceId.videoId;
  if (isPlayerReady && player.cueVideoById) {
    player.cueVideoById(videoId);
    updateNowPlayingHighlight();  // ✅ NEW
    updateNavButtons();
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

function resetKiosk() {
  document.getElementById('playlistButtons').innerHTML = '';
  document.getElementById('playlistVideos').innerHTML = '';
  document.documentElement.style.fontSize = '100%';
  selectedPlaylistId = null;
  loadPlaylists();
      updateNavButtons(); 
}

function adjustFontSize(stepPercent) {
  const html = document.documentElement;
  const current = parseFloat(window.getComputedStyle(html).fontSize);
  const newSize = Math.max(12, Math.min(40, current * (1 + stepPercent / 100)));
  html.style.fontSize = newSize + 'px';
}

function onPlayerStateChange(event) {
  const button = document.querySelector('.playback-controls button[data-action="toggle"]');
  if (!button) return;

  if (event.data === YT.PlayerState.PLAYING) {
    button.innerHTML = '❚❚<br><span class="icon-label">Pause</span>';
  } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.CUED) {
    button.innerHTML = '▶<br><span class="icon-label">Play</span>';
  }
}

function highlightSelectedPlaylistButton(activeId) {
  const buttons = document.querySelectorAll('#playlistButtons button');
  buttons.forEach(btn => {
    btn.classList.remove('active-playlist');
    if (btn.textContent.trim() === getPlaylistNameById(activeId)) {
      btn.classList.add('active-playlist');
    }
  });
}

function getPlaylistNameById(id) {
  const pl = window.loadedPlaylists?.find(p => p.id === id);
  return pl ? pl.name : '';
}


document.addEventListener('DOMContentLoaded', () => {
  const decBtn = document.getElementById('fontDec');
  const incBtn = document.getElementById('fontInc');
  if (decBtn) decBtn.addEventListener('click', () => adjustFontSize(-10));
  if (incBtn) incBtn.addEventListener('click', () => adjustFontSize(10));
});
