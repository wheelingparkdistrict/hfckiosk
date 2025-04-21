// script.js - HFC Kiosk YouTube API

let player;
let currentPlaylist = [];
let currentIndex = 0;
let fontSize = 16;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      controls: 1,
    }
  });
}

async function loadPlaylist(playlistId) {
  const API_KEY = "AIzaSyBXOnPb8MKxBE1pT6SYvdQdX_87350Nk9g";
  const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${API_KEY}`);
  const data = await response.json();

  currentPlaylist = data.items.map(item => ({
    videoId: item.snippet.resourceId.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.medium.url
  }));

  currentIndex = 0;
  populatePlaylist();
  loadVideo(currentIndex);
}

function populatePlaylist() {
  const browser = document.getElementById('playlistBrowser');
  browser.innerHTML = "";

  currentPlaylist.forEach((video, index) => {
    const div = document.createElement('div');
    div.className = 'playlist-video';
    div.onclick = () => loadVideo(index);
    div.innerHTML = `
      <img src="${video.thumbnail}" alt="${video.title}">
      <span>${video.title}</span>
    `;
    browser.appendChild(div);
  });
}

function loadVideo(index) {
  currentIndex = index;
  player.loadVideoById(currentPlaylist[currentIndex].videoId);
}

function previousVideo() {
  if (currentIndex > 0) {
    currentIndex--;
    loadVideo(currentIndex);
  }
}

function nextVideo() {
  if (currentIndex < currentPlaylist.length - 1) {
    currentIndex++;
    loadVideo(currentIndex);
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

function adjustFontSize(delta) {
  fontSize = Math.min(24, Math.max(12, fontSize + delta));
  document.getElementById('playlistPane').style.fontSize = fontSize + 'px';
}
