const apiKey = 'AIzaSyBXOnPb8MKxBE1pT6SYvdQdX_87350Nk9g';
const player = document.getElementById('player');
const videosList = document.getElementById('videosList');
const fontSizes = ["0.8rem", "1rem", "1.2rem", "1.4rem"];
let currentFontSize = 1;

document.getElementById('fontUp').onclick = () => {
  if (currentFontSize < fontSizes.length - 1) currentFontSize++;
  document.getElementById('playlistPane').style.fontSize = fontSizes[currentFontSize];
};

document.getElementById('fontDown').onclick = () => {
  if (currentFontSize > 0) currentFontSize--;
  document.getElementById('playlistPane').style.fontSize = fontSizes[currentFontSize];
};

document.getElementById('reload').onclick = () => location.reload();

document.querySelectorAll('#playlistButtons button').forEach(button => {
  button.addEventListener('click', () => {
    loadPlaylist(button.getAttribute('data-playlist'));
  });
});

function loadPlaylist(playlistId) {
  fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=25&key=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      videosList.innerHTML = '';
      data.items.forEach(video => {
        const videoId = video.snippet.resourceId.videoId;
        const videoTitle = video.snippet.title;
        const thumbnail = video.snippet.thumbnails.medium.url;

        const videoItem = document.createElement('div');
        videoItem.className = 'videoItem';
        videoItem.innerHTML = `
          <img src="${thumbnail}" alt="${videoTitle}">
          <span>${videoTitle}</span>
        `;
        videoItem.onclick = () => {
          player.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&controls=1&modestbranding=1`;
        };
        videosList.appendChild(videoItem);
      });

      // Load first video by default
      if (data.items.length > 0) {
        player.src = `https://www.youtube-nocookie.com/embed/${data.items[0].snippet.resourceId.videoId}?autoplay=0&controls=1&modestbranding=1`;
      }
    })
    .catch(error => console.error('Error loading playlist:', error));
}

// Initial default load
loadPlaylist('PLRdkgOpCgKLCHW0LepxgvtZhCPAKpA_ph');
