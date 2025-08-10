document.addEventListener('DOMContentLoaded', () => {

    // ==================== SELECTORS ====================
    const playlistEl = document.querySelector("#playlist");
    const backgroundEl = document.querySelector(".background");
    const trackArtEl = document.querySelector("#trackArt");
    const trackNameEl = document.querySelector("#trackName");
    const trackArtistEl = document.querySelector("#trackArtist");
    const playPauseBtn = document.querySelector("#playPauseBtn");
    const nextBtn = document.querySelector("#nextBtn");
    const prevBtn = document.querySelector("#prevBtn");
    const seekSlider = document.querySelector("#seekSlider");
    const volumeSlider = document.querySelector("#volumeSlider");
    const currTimeEl = document.querySelector("#currentTime");
    const totalDurationEl = document.querySelector("#totalDuration");
    const availableSelect = document.querySelector("#availableSelect");
    const addBtn = document.querySelector("#addBtn");

    // ==================== STATE ====================
    const masterTrackLibrary = [
        { name: "APT.", artist: "ROSÉ", path: "APT.mp3", artwork: "APT.jpg" },
        { name: "That's so true", artist: "Gracie Abrams", path: "that's so true.mp3", artwork: "tsoud.jpg" },
        { name: "August", artist: "Taylor Swift", path: "august.mp3", artwork: "folklore.jpg" },
        { name: "Counting Stars", artist: "OneRepublic", path: "counting stars.mp3", artwork: "Native.jpg" },
        { name: "Just Keep Watching", artist: "Tate McRae", path: "F1 jkw.mp3", artwork: "F1.jpg" },
        { name: "good 4 u", artist: "Olivia Rodrigo", path: "good4u.mp3", artwork: "SOUR.jpg" },
        { name: "Anti-Hero", artist: "Taylor Swift", path: "anti-hero.mp3", artwork: "Midnights.jpg" },
        { name: "Last Christmas - Single", artist: "WHAM!", path: "lastchristmas.mp3", artwork: "lastchristmas.jpg" },
        { name: "Risk", artist: "Gracie Abrams", path: "risk.mp3", artwork: "tsou.jpg" },
        { name: "drivers license", artist: "Olivia Rodrigo", path: "drivers license.mp3", artwork: "SOUR.jpg" },
        { name: "like JENNIE", artist: "JENNIE", path: "like JENNIE.mp3", artwork: "RUBY.jpg" },
        { name: "Pink Skies", artist: "LANY", path: "pinkskies.mp3", artwork: "pinkskies.jpg" },
        { name: "Difficult", artist: "Gracie Abrams", path: "difficult.mp3", artwork: "difficult.jpg" },
        { name: "WILD", artist: "Troye Sivan", path: "troye-sivan-wild.mp3", artwork: "WILD.jpg" },
        { name: "two years", artist: "ROSÉ", path: "two yrs.mp3", artwork: "rosie.jpg" },
        { name: "ballad of a homeschooled girl", artist: "Olivia Rodrigo", path: "boahg.mp3", artwork: "guts.jpg" },
        { name: "Mess It Up", artist: "Gracie Abrams", path: "messitup.mp3", artwork: "miu.jpg" },
        { name: "Seventeen", artist: "Troye Sivan", path: "17.mp3", artwork: "BLOOM.jpg" },
        { name: "21", artist: "Gracie Abrams", path: "21.mp3", artwork: "minor.jpg" },
        { name: "Better", artist: "Gracie Abrams", path: "better.mp3", artwork: "tiwifl.jpg" }
    ];
    // The active playlist now starts with the first song from the library
    let trackList = [masterTrackLibrary[0]];
    
    let trackIndex = 0;
    let isPlaying = false;
    let updateTimer;
    let draggedIndex = null;
    const currTrack = document.createElement("audio");

    // ==================== FUNCTIONS ====================

    function populateAvailableTracks() {
        availableSelect.innerHTML = "";
        masterTrackLibrary.forEach(track => {
            const isInPlaylist = trackList.some(playlistTrack => playlistTrack.path === track.path);
            if (!isInPlaylist) {
                const option = document.createElement('option');
                option.value = track.path;
                option.textContent = `${track.artist} - ${track.name}`;
                availableSelect.appendChild(option);
            }
        });
    }

    function loadTrack(index) {
        if (index < 0 || index >= trackList.length) return;
        clearInterval(updateTimer);
        resetValues();
        currTrack.src = trackList[index].path;
        currTrack.load();
        trackArtEl.style.backgroundImage = `url(${trackList[index].artwork})`;
        trackNameEl.textContent = trackList[index].name;
        trackArtistEl.textContent = trackList[index].artist;
        backgroundEl.style.backgroundImage = `url(${trackList[index].artwork})`;
        updateTimer = setInterval(seekUpdate, 1000);
        currTrack.addEventListener("ended", nextTrack);
    }

    function resetValues() {
        currTimeEl.textContent = "00:00";
        totalDurationEl.textContent = "00:00";
        seekSlider.value = 0;
    }

    function playpauseTrack() { if (trackList.length > 0) isPlaying ? pauseTrack() : playTrack(); }
    function playTrack() { currTrack.play(); isPlaying = true; playPauseBtn.innerHTML = '<i class="fas fa-pause-circle"></i>'; }
    function pauseTrack() { currTrack.pause(); isPlaying = false; playPauseBtn.innerHTML = '<i class="fas fa-play-circle"></i>'; }

    function nextTrack() {
        if (trackList.length === 0) return;

        const isLastTrackInPlaylist = (trackIndex === trackList.length - 1);

        // If on the last track, try to add the next song from the master library
        if (isLastTrackInPlaylist) {
            const lastTrackPath = trackList[trackIndex].path;
            const lastTrackIndexInMaster = masterTrackLibrary.findIndex(track => track.path === lastTrackPath);

            if (lastTrackIndexInMaster < masterTrackLibrary.length - 1) {
                const nextSongFromMaster = masterTrackLibrary[lastTrackIndexInMaster + 1];
                trackList.push(nextSongFromMaster);
                populateAvailableTracks(); // Update the dropdown
            }
        }
        
        trackIndex = (trackIndex + 1) % trackList.length;
        loadTrack(trackIndex);
        renderPlaylist();
        playTrack();
    }

    function prevTrack() {
        if (trackList.length === 0) return;
        trackIndex = (trackIndex - 1 + trackList.length) % trackList.length;
        loadTrack(trackIndex);
        renderPlaylist();
        playTrack();
    }
    
    function seekTo() { currTrack.currentTime = currTrack.duration * (seekSlider.value / 100); }
    function setVolume() { currTrack.volume = volumeSlider.value / 100; }

    function seekUpdate() {
        if (!isNaN(currTrack.duration)) {
            seekSlider.value = (currTrack.currentTime / currTrack.duration) * 100;
            const formatTime = (sec) => {
                const minutes = String(Math.floor(sec / 60)).padStart(2, '0');
                const seconds = String(Math.floor(sec % 60)).padStart(2, '0');
                return `${minutes}:${seconds}`;
            }
            currTimeEl.textContent = formatTime(currTrack.currentTime);
            totalDurationEl.textContent = formatTime(currTrack.duration);
        }
    }

    function renderPlaylist() {
        playlistEl.innerHTML = "";
        trackList.forEach((track, i) => {
            const li = document.createElement("li");
            li.setAttribute('draggable', 'true');
            if (i === trackIndex) {
                li.classList.add('active');
            }
            li.innerHTML = `<div class="thumb" style="background-image:url('${track.artwork}')"></div><div class="meta"><div class="n">${track.name}</div><div class="a">${track.artist}</div></div><button class="delete-btn"></button>`;
            li.addEventListener('click', () => { trackIndex = i; loadTrack(trackIndex); renderPlaylist(); playTrack(); });
            li.querySelector(".delete-btn").addEventListener("click", (e) => {
                e.stopPropagation();
                const wasCurrentlyPlaying = (i === trackIndex);
                trackList.splice(i, 1);
                populateAvailableTracks();
                if (wasCurrentlyPlaying) {
                    if (trackList.length > 0) {
                        trackIndex = (i >= trackList.length) ? 0 : i;
                        loadTrack(trackIndex);
                        pauseTrack();
                    }
                } else if (i < trackIndex) {
                    trackIndex--;
                }
                renderPlaylist();
            });
            li.addEventListener('dragstart', () => { draggedIndex = i; setTimeout(() => li.classList.add('dragging'), 0); });
            li.addEventListener('dragend', () => { li.classList.remove('dragging'); });
            playlistEl.appendChild(li);
        });
    }

    // ==================== EVENT LISTENERS ====================
    addBtn.addEventListener('click', () => {
        const selectedPath = availableSelect.value;
        if (!selectedPath) return;
        const songToAdd = masterTrackLibrary.find(track => track.path === selectedPath);
        if (songToAdd) {
            trackList.push(songToAdd);
            renderPlaylist();
            populateAvailableTracks();
        }
    });
    playPauseBtn.addEventListener("click", playpauseTrack);
    nextBtn.addEventListener("click", nextTrack);
    prevBtn.addEventListener("click", prevTrack);
    seekSlider.addEventListener("input", seekTo);
    volumeSlider.addEventListener("input", setVolume);
    playlistEl.addEventListener('dragover', (e) => { e.preventDefault(); });
    playlistEl.addEventListener('drop', (e) => {
        e.preventDefault();
        const dropTarget = e.target.closest('li');
        if (!dropTarget) return;
        const dropIndex = Array.from(playlistEl.children).indexOf(dropTarget);
        const currentlyPlayingPath = trackList[trackIndex]?.path;
        const [draggedItem] = trackList.splice(draggedIndex, 1);
        trackList.splice(dropIndex, 0, draggedItem);
        trackIndex = trackList.findIndex(track => track.path === currentlyPlayingPath);
        renderPlaylist();
    });
    document.addEventListener('keydown', (e) => {
        switch (e.code) {
            case 'Space': e.preventDefault(); playpauseTrack(); break;
            case 'ArrowRight': e.preventDefault(); currTrack.currentTime += 10; break;
            case 'ArrowLeft': e.preventDefault(); currTrack.currentTime -= 10; break;
        }
    });

    // ==================== INITIALIZATION ====================
    loadTrack(0);      // Load the first track from the new playlist
    pauseTrack();      // Ensure it starts in a paused state
    renderPlaylist();  // Render the one-item playlist
    populateAvailableTracks(); // Fill the dropdown with remaining songs
});
