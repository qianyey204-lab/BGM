//------------------------------------------------------------------------------------------------------------------
//    初期設定
//------------------------------------------------------------------------------------------------------------------
// 曲リスト
import { songListBGM } from './songlist_BGM.js';
import { songListSAS } from './songlist_SAS.js';
import { songListDisco } from './songlist_Disco.js';

// 変数初期化
const folderSelect = document.getElementById('folderSelect');
const artistSpan   = document.getElementById('artist-title');
const titleSpan    = document.getElementById('music-title');
const playBtn      = document.getElementById('btn-play');
const pauseBtn     = document.getElementById('btn-pause');
const skipBtn      = document.getElementById('btn-skip');

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

//------------------------------------------------------------------------------------------------------------------
//    シャッフル処理
//------------------------------------------------------------------------------------------------------------------
function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

//------------------------------------------------------------------------------------------------------------------
//    フォルダ読み込み処理
//------------------------------------------------------------------------------------------------------------------
function loadFolder(folderName) {
  currentFolder = folderName;
  if (folderName === 'BGM') {
    fullList = songListBGM.slice();
  } else if (folderName === 'SAS') {
    fullList = songListSAS.slice();
  } else {
    fullList = songListDisco.slice();
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
  pauseBtn.disabled = true;
  skipBtn.disabled = true;
}

//------------------------------------------------------------------------------------------------------------------
//    表示切替処理
//------------------------------------------------------------------------------------------------------------------
function updateDisplay(track) {
  if (!track) {
    artistSpan.textContent = '-';
    titleSpan.textContent = '-';
  } else {
    artistSpan.textContent = track.artist;
    titleSpan.textContent = track.title;
  }
}

//------------------------------------------------------------------------------------------------------------------
//    PLAY状態処理
//------------------------------------------------------------------------------------------------------------------
function setStatePlaying() {
  isPlaying = true;
  isPaused = false;
  playBtn.disabled = true;   // 再生中はPLAY無効
  pauseBtn.disabled = false; // PAUSE有効
  skipBtn.disabled = false;  // SKIP有効
}

//------------------------------------------------------------------------------------------------------------------
//    一時停止状態処理
//------------------------------------------------------------------------------------------------------------------
function setStatePaused() {
  isPlaying = false;
  isPaused = true;
  playBtn.disabled = false;  // 再開できる
  pauseBtn.disabled = true;  // 一時停止中はPAUSE無効
  skipBtn.disabled = false;  // SKIPは有効のまま
}

//------------------------------------------------------------------------------------------------------------------
//    次曲選曲処理
//------------------------------------------------------------------------------------------------------------------
function setStateStoppedNoMoreTracks() {
  isPlaying = false;
  isPaused = false;
  playBtn.disabled = true;   // もう曲がない
  pauseBtn.disabled = true;
  skipBtn.disabled = true;
}

//------------------------------------------------------------------------------------------------------------------
//    ランダム選曲処理
//------------------------------------------------------------------------------------------------------------------
function pickNextRandomTrack() {
  if (remainingList.length === 0) {
    // 全曲再生済み
    return null;
  }
  // remainingList から1曲取り出す
  const track = remainingList.shift();
  return track;
}

//------------------------------------------------------------------------------------------------------------------
//    演奏処理
//------------------------------------------------------------------------------------------------------------------
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
      // エラー時は次の曲へスキップ
      const next = pickNextRandomTrack();
      playTrack(next);
    });
}

//------------------------------------------------------------------------------------------------------------------
//    PLAY処理
//------------------------------------------------------------------------------------------------------------------
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

//------------------------------------------------------------------------------------------------------------------
//    一時停止処理
//------------------------------------------------------------------------------------------------------------------
pauseBtn.addEventListener('click', () => {
  if (!isPlaying) return;
  audio.pause();
  setStatePaused();
});

//------------------------------------------------------------------------------------------------------------------
//    スキップボタン処理
//------------------------------------------------------------------------------------------------------------------
skipBtn.addEventListener('click', () => {
  audio.pause();
  const next = pickNextRandomTrack();
  playTrack(next);
});

//------------------------------------------------------------------------------------------------------------------
//    演奏終了後、次曲PLAY処理
//------------------------------------------------------------------------------------------------------------------
audio.addEventListener('ended', () => {
  const next = pickNextRandomTrack();
  playTrack(next);
});

//------------------------------------------------------------------------------------------------------------------
//    フォルダ切替処理
//------------------------------------------------------------------------------------------------------------------
folderSelect.addEventListener('change', (e) => {
  loadFolder(e.target.value);
});

//------------------------------------------------------------------------------------------------------------------
//    起動時初期フォルダ処理
//------------------------------------------------------------------------------------------------------------------
loadFolder('BGM');