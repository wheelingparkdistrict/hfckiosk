<script>
  let player;
  const fontSizes = ["0.8rem", "1rem", "1.2rem", "1.4rem"];
  let currentFontSize = 1;
  let currentPlaylistId = 'PLRdkgOpCgKLCHW0LepxgvtZhCPAKpA_ph';

  function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
      height: '100%',
      width: '100%',
      playerVars: {
        'listType': 'playlist',
        'list': currentPlaylistId,
        'autoplay': 0,
        'controls': 1,
        'modestbranding': 1,
        'rel': 0
      }
    });
  }

  document.getElementById('fontUp').onclick = () => {
    if (currentFontSize < fontSizes.length - 1) currentFontSize++;
    document.getElementById('playlistPane').style.fontSize = fontSizes[currentFontSize];
  };

  document.getElementById('fontDown').onclick = () => {
    if (currentFontSize > 0) currentFontSize--;
    document.getElementById('playlistPane').style.fontSize = fontSizes[currentFontSize];
  };

  document.getElementById('reload').onclick = () => location.reload();

  function loadPlaylist(playlistId) {
    currentPlaylistId = playlistId;
    player.loadPlaylist({list: playlistId});
  }

  document.getElementById('playpause').onclick = () => {
    const state = player.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  document.getElementById('prev').onclick = () => player.previousVideo();
  document.getElementById('next').onclick = () => player.nextVideo();
</script>
