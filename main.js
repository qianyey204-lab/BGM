// main.js
import { songListBGM } from './songlist_BGM.js';
import { songListSAS } from './songlist_SAS.js';

const folderSelect = document.getElementById('folderSelect');
const artistSpan   = document.getElementById('artist');
const titleSpan    = document.getElementById('title');
const playBtn      = document.getElementById('playBtn');
const pauseBtn     = document.getElementById('pauseBtn');
const skipBtn      = document.getElementById('skipBtn');

let audio = new Audio();
let currentFolder = 'BGM';

// 現在のフォルダの全曲リスト
let fullList = [];
// まだ再生していない曲のプール（ランダムに消費）
let remainingList = [];
// 現在再生中の曲
let currentTrack = null;
// 再生中かどうか
let isPlaying = false;
let isPaused = false;

function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function loadFolder(folderName) {
  currentFolder = folderName;
  if (folderName === 'BGM') {
    fullList = songListBGM.slice();
  } else {
    fullList = songListSAS.slice();
  }
  remainingList = shuffle(fullList);
  currentTrack = null;
  isPlaying = false;
  isPaused = false;
  audio.pause();
  audio.src = '';
  artistSpan.textContent = '-';
  titleSpan.textContent = '-';

  // 初期状態：PLAYのみ有効
  playBtn.disabled = false;
  pauseBtn.disabled = false; // 再生開始までは押しても何も起きないようにするなら true でもOK
  pauseBtn.disabled = true;
  skipBtn.disabled = true;
}

function updateDisplay(track) {
  if (!track) {
    artistSpan.textContent = '-';
    titleSpan.textContent = '-';
  } else {
    artistSpan.textContent = track.artist;
    titleSpan.textContent = track.title;
  }
}

function setStatePlaying() {
  isPlaying = true;
  isPaused = false;
  playBtn.disabled = true;   // 再生中はPLAY無効
  pauseBtn.disabled = false; // PAUSE有効
  skipBtn.disabled = false;  // SKIP有効
}

function setStatePaused() {
  isPlaying = false;
  isPaused = true;
  playBtn.disabled = false;  // 再開できる
  pauseBtn.disabled = true;  // 一時停止中はPAUSE無効
  skipBtn.disabled = false;  // SKIPは有効のまま
}

function setStateStoppedNoMoreTracks() {
  isPlaying = false;
  isPaused = false;
  playBtn.disabled = true;   // もう曲がない
  pauseBtn.disabled = true;
  skipBtn.disabled = true;
}

function pickNextRandomTrack() {
  if (remainingList.length === 0) {
    // 全曲再生済み
    return null;
  }
  // remainingList から1曲取り出す（先頭でOK：事前にシャッフル済み）
  const track = remainingList.shift();
  return track;
}

function playTrack(track) {
  if (!track) {
    setStateStoppedNoMoreTracks();
    updateDisplay(null);
    return;
  }

  currentTrack = track;
  updateDisplay(track);

  audio.src = track.url;
  audio.currentTime = 0;
  audio.play()
    .then(() => {
      setStatePlaying();
    })
    .catch(err => {
      console.error('再生エラー:', err);
      // エラー時は次の曲へスキップしてもいい
      const next = pickNextRandomTrack();
      playTrack(next);
    });
}

// PLAYボタン：
// ・停止中 or 初回 → ランダムに1曲選んで再生
// ・一時停止中 → 再開
playBtn.addEventListener('click', () => {
  if (isPaused && currentTrack) {
    // 再開
    audio.play()
      .then(() => {
        setStatePlaying();
      })
      .catch(err => console.error('再開エラー:', err));
  } else {
    // 初回 or 完全停止状態 → 新しい曲をランダム再生
    const next = pickNextRandomTrack();
    playTrack(next);
  }
});

// PAUSEボタン：一時停止
pauseBtn.addEventListener('click', () => {
  if (!isPlaying) return;
  audio.pause();
  setStatePaused();
});

// SKIPボタン：今の曲を止めて次のランダム曲へ
skipBtn.addEventListener('click', () => {
  audio.pause();
  const next = pickNextRandomTrack();
  playTrack(next);
});

// 曲が自然終了したとき → 自動で次のランダム曲へ
audio.addEventListener('ended', () => {
  const next = pickNextRandomTrack();
  playTrack(next);
});

// フォルダ切替
folderSelect.addEventListener('change', (e) => {
  loadFolder(e.target.value);
});

// 初期化（デフォルトはBGM）
loadFolder('BGM');
