
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
  const container = document.getElementById('videoList');
  if (!container) return;
  container.innerHTML = ''; // Prevent duplication

  const defaultPlaylist = playlists.find(p => p.default);
  if (!defaultPlaylist) return;

  currentPlaylist = defaultPlaylist.videos;
  currentVideoIndex = 0;
  updateVideoList();
  loadVideo(currentPlaylist[currentVideoIndex].id);
}

function updateVideoList() {
  const container = document.getElementById('videoList');
  if (!container) return;
  container.innerHTML = ''; // Clear previous entries

  currentPlaylist.forEach((video, index) => {
    const item = document.createElement('div');
    item.className = 'videoItem' + (index === currentVideoIndex ? ' selected' : '');
    item.onclick = () => {
      currentVideoIndex = index;
      loadVideo(video.id);
      updateVideoList();
    };

    const thumbnail = document.createElement('img');
    thumbnail.src = `https://img.youtube.com/vi/${video.id}/default.jpg`;

    const title = document.createElement('div');
    title.className = 'videoTitle';
    title.textContent = video.title;

    const duration = document.createElement('div');
    duration.className = 'videoDuration';
    duration.textContent = video.duration;

    item.appendChild(thumbnail);
    item.appendChild(title);
    item.appendChild(duration);
    container.appendChild(item);
  });
}

function loadVideo(videoId) {
  if (isPlayerReady && player.loadVideoById) {
    player.loadVideoById(videoId);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const prevBtn = document.getElementById('prevBtn');
  const playBtn = document.getElementById('playBtn');
  const nextBtn = document.getElementById('nextBtn');
  const fontInc = document.getElementById('fontInc');
  const fontDec = document.getElementById('fontDec');
  const resetBtn = document.getElementById('resetBtn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentVideoIndex > 0) {
        currentVideoIndex--;
        loadVideo(currentPlaylist[currentVideoIndex].id);
        updateVideoList();
      }
    });
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (isPlayerReady && player.playVideo) player.playVideo();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentVideoIndex < currentPlaylist.length - 1) {
        currentVideoIndex++;
        loadVideo(currentPlaylist[currentVideoIndex].id);
        updateVideoList();
      }
    });
  }

  if (fontInc) {
    fontInc.addEventListener('click', () => {
      document.body.style.fontSize = (parseFloat(getComputedStyle(document.body).fontSize) + 1) + 'px';
    });
  }

  if (fontDec) {
    fontDec.addEventListener('click', () => {
      document.body.style.fontSize = (parseFloat(getComputedStyle(document.body).fontSize) - 1) + 'px';
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      location.reload();
    });
  }
});
