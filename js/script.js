let songs;
let currfolder;
let currentSong = new Audio();
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder) {
  // Use static songsIndex.json (works on GitHub Pages - no directory listing needed)
  currfolder = folder; 
  // Normalize folder key to just the subfolder name
  const parts = folder.split("/").filter(Boolean);
  const folderKey = parts[parts.length - 1];

  const res = await fetch("song/songsIndex.json");
  const data = await res.json();
  const album = data.albums.find(a => a.folder === folderKey);
  songs = [];
  if (album && album.tracks) {
    songs = album.tracks.map(t => t.file);
  }

  // Render list in the left pane
  let songUL = document.querySelector(".song-list").getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML += `
      <li>
        <img class="invert"  src="./images/music.svg">
        <div class="info">
          <div>${song.replaceAll("%20"," ")}</div>
          <div>Songs</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="./images/play.svg">
        </div>
      </li>`;
  }

  Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

const playMusic = (track,pause=false) => {
  currentSong.src = `${currfolder}/` + track;
  
  if(! pause){
    currentSong.play();
    play.src = "images/pause.svg";
  }
 
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

async function displayAlbums() {
  const res = await fetch("song/songsIndex.json");
  const data = await res.json();
  let cardContainer = document.querySelector(".card-container");
  cardContainer.innerHTML = "";
  data.albums.forEach(alb => {
    const folder = alb.folder;
    const cover = alb.cover || "images/music.svg";
    cardContainer.innerHTML += `
      <div data-folder="${folder}" class="card rounded">
        <div class="play">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#000">
            <path d="M5 20V4L19 12L5 20Z" />
          </svg>
        </div>
        <img src="${cover}" alt="cover">
        <h2>${alb.displayName || folder}</h2>
        <p>${alb.description || ""}</p>
      </div>`;
  });

  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      songs = await getSongs(`song/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0], true);
    });
  });
}
 

    
async function main() {
  // Load albums and default to the first album (from static index)
  const res = await fetch("song/songsIndex.json");
  const data = await res.json();
  
  const first = (data.albums && data.albums[0]) ? data.albums[0].folder : null;
  if (first) {
    await getSongs(`song/${first}`);
    playMusic(songs[0], true);
  }
  const defaultAlbum = data.albums.find(a => a.folder === "cs");

  if (defaultAlbum) {
    await getSongs(`song/${defaultAlbum.folder}`);
    playMusic(songs[0], true);
  }
  await displayAlbums();

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "./images/pause.svg";
    } else {
      currentSong.pause();
      play.src = "./images/play.svg";
    }
  });
   // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })


     document.querySelector(".seekbar").addEventListener("click", e => {
       let percent=(e.offsetX / e.target.getBoundingClientRect().width) * 100
       document.querySelector(".circle").style.left = percent + "%";
      currentSong.currentTime = ((currentSong.duration) * percent) / 100
  })


    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })
  // previous
previous.addEventListener("click", () => {
    currentSong.pause();
    let currentTrack = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]); 
    let index = songs.indexOf(currentTrack);
    if ((index - 1) >= 0) {
        playMusic(songs[index - 1]);
    }
});

// next
nextButton.addEventListener("click", () => {
    currentSong.pause();
    let currentTrack = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]);
    let index = songs.indexOf(currentTrack);
    if ((index + 1) < songs.length) {
        playMusic(songs[index + 1]);
    }
});
        // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })
        // Load the playlist whenever card is clicked
  
  // Load the playlist whenever card is clicked
   

        // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    }) 
    
    

}

main();

// signup button navigation
document.getElementById("signupBtn").addEventListener("click", function () {
    window.location.href = "signup.html";
});

// login button navigation
document.getElementById("loginBtn").addEventListener("click", function () {
    window.location.href = "login.html";
});

// --- Search functionality for song list ---
function initSearch() {
  const searchIcon = document.getElementById("searchIcon");
  const searchInput = document.getElementById("searchInput");
  const resultMessage = document.getElementById("resultMessage");
  const songUL = document.querySelector(".song-list ul");

  // Show input when search icon clicked
  searchIcon.addEventListener("click", () => {
    searchInput.style.display = "inline-block";
    searchInput.focus();
  });

  // Filter songs dynamically
  searchInput.addEventListener("keyup", () => {
    const query = searchInput.value.toLowerCase();

    if (!query) {
      Array.from(songUL.getElementsByTagName("li")).forEach(li => li.style.display = "flex");
      resultMessage.innerText = "";
      return;
    }

    let found = false;
    Array.from(songUL.getElementsByTagName("li")).forEach(li => {
      const songName = li.querySelector(".info div").innerText.toLowerCase();
      if (songName.includes(query)) {
        li.style.display = "flex";
        found = true;
      } else {
        li.style.display = "none";
      }
    });

    resultMessage.innerText = found ? "" : "❌ Not Found";
  });
}

// Initialize search after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initSearch();
});
// script.js
document.addEventListener("DOMContentLoaded", () => {
  const menuItems = document.querySelectorAll("ul li");
  const currentPage = window.location.pathname; // get current page path

  menuItems.forEach(item => {
    if (item.textContent.trim().toLowerCase() === "home") {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
});




document.addEventListener("DOMContentLoaded", () => {
  initSearch();
  setActiveHome();
});
const searchContainer = document.getElementById("searchContainer");
const searchIcon = document.getElementById("searchIcon");
const searchInput = document.getElementById("searchInput");
const searchText = document.getElementById("searchText");

// Before (In your last script block):
searchContainer.addEventListener("click", (e) => {
if (e.target !== searchInput) {
searchContainer.classList.toggle("active");

if (searchContainer.classList.contains("active")) {
 searchText.style.display = "none"; // <-- Remove this line
 searchInput.style.display = "inline-block"; // <-- Remove this line (CSS handles this too)
 searchIcon.classList.add("active-green");
 searchInput.focus();
} else {
 searchText.style.display = "inline-block"; // <-- Remove this line
 searchInput.style.display = "none"; // <-- Remove this line (CSS handles this too)
 searchIcon.classList.remove("active-green");
}
 }
});

// After Simplification (Recommended):
searchContainer.addEventListener("click", (e) => {
 if (e.target !== searchInput) {
searchContainer.classList.toggle("active");

if (searchContainer.classList.contains("active")) {
 searchIcon.classList.add("active-green");
 searchInput.focus();
} else {
 searchIcon.classList.remove("active-green");
}
 }
});
