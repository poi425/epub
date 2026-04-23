// app.js — UI 인터랙션 및 상태 관리

let chapterCount = 0;
let selectedStyle = 'modern';
let selectedFontSize = 'medium';
let coverFile = null;

// --- 표지 이미지 업로드 ---
function initCoverUpload() {
  const area = document.getElementById('cover-upload-area');
  const fileInput = document.getElementById('cover-file-input');
  const placeholder = document.getElementById('cover-placeholder');
  const previewWrap = document.getElementById('cover-preview-wrap');
  const previewImg = document.getElementById('cover-preview-img');
  const changeBtn = document.getElementById('cover-change-btn');
  const removeBtn = document.getElementById('cover-remove-btn');

  function setCover(file) {
    if (!file || !file.type.startsWith('image/')) return;
    coverFile = file;
    const url = URL.createObjectURL(file);
    previewImg.src = url;
    placeholder.style.display = 'none';
    previewWrap.style.display = 'flex';
  }

  function removeCover() {
    coverFile = null;
    previewImg.src = '';
    previewWrap.style.display = 'none';
    placeholder.style.display = 'flex';
    fileInput.value = '';
  }

  area.addEventListener('click', e => {
    if (e.target === removeBtn || e.target === changeBtn) return;
    fileInput.click();
  });
  changeBtn.addEventListener('click', () => fileInput.click());
  removeBtn.addEventListener('click', removeCover);
  fileInput.addEventListener('change', () => { if (fileInput.files[0]) setCover(fileInput.files[0]); });

  area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drag-over'); });
  area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
  area.addEventListener('drop', e => {
    e.preventDefault();
    area.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) setCover(file);
  });
}
initCoverUpload();

// --- 챕터 추가 ---
function addChapter(title = '', content = '') {
  chapterCount++;
  const list = document.getElementById('chapters-list');
  const div = document.createElement('div');
  div.className = 'chapter-item';
  div.dataset.id = chapterCount;

  div.innerHTML = `
    <div class="chapter-header">
      <span class="chapter-num">챕터 ${list.children.length + 1}</span>
      <div class="chapter-actions">
        <button class="btn-move-up" onclick="moveChapter(this, -1)">↑</button>
        <button class="btn-move-down" onclick="moveChapter(this, 1)">↓</button>
        <button class="btn-delete" onclick="deleteChapter(this)">삭제</button>
      </div>
    </div>
    <input type="text" class="chapter-title-input" placeholder="챕터 제목" value="${escAttr(title)}" />
    <textarea class="chapter-content" placeholder="챕터 내용을 입력하세요.&#10;&#10;# 로 시작하면 소제목이 됩니다.&#10;&#10;빈 줄은 단락을 구분합니다.">${escText(content)}</textarea>
    <div class="chapter-word-count">0자</div>
  `;

  const textarea = div.querySelector('.chapter-content');
  const wordCount = div.querySelector('.chapter-word-count');
  const updateCount = () => {
    const len = textarea.value.replace(/\s/g, '').length;
    wordCount.textContent = len.toLocaleString() + '자';
  };
  textarea.addEventListener('input', updateCount);
  updateCount();

  list.appendChild(div);
  refreshChapterNumbers();
  textarea.focus();
}

function escAttr(s) { return s.replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
function escText(s) { return s.replace(/</g, '&lt;'); }

function deleteChapter(btn) {
  if (!confirm('이 챕터를 삭제할까요?')) return;
  btn.closest('.chapter-item').remove();
  refreshChapterNumbers();
}

function moveChapter(btn, dir) {
  const item = btn.closest('.chapter-item');
  const list = item.parentElement;
  const items = [...list.children];
  const idx = items.indexOf(item);
  const target = items[idx + dir];
  if (!target) return;
  if (dir === -1) list.insertBefore(item, target);
  else list.insertBefore(target, item);
  refreshChapterNumbers();
}

function refreshChapterNumbers() {
  document.querySelectorAll('.chapter-item .chapter-num').forEach((el, i) => {
    el.textContent = `챕터 ${i + 1}`;
  });
}

// --- 스타일 선택 ---
document.querySelectorAll('.style-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.style-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedStyle = card.dataset.style;
  });
});

// --- 폰트 크기 ---
document.querySelectorAll('.fs-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.fs-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedFontSize = btn.dataset.size;
  });
});

// --- 챕터 추가 버튼 ---
document.getElementById('add-chapter').addEventListener('click', () => addChapter());

// --- EPUB 생성 ---
document.getElementById('generate-btn').addEventListener('click', async () => {
  const title = document.getElementById('book-title').value.trim();
  const author = document.getElementById('book-author').value.trim();

  if (!title || !author) {
    alert('제목과 저자를 입력해주세요.');
    if (!title) document.getElementById('book-title').focus();
    else document.getElementById('book-author').focus();
    return;
  }

  const chapters = [];
  document.querySelectorAll('.chapter-item').forEach(item => {
    const t = item.querySelector('.chapter-title-input').value.trim();
    const c = item.querySelector('.chapter-content').value.trim();
    if (t || c) {
      chapters.push({ title: t || '제목 없음', content: c });
    }
  });

  if (chapters.length === 0) {
    alert('챕터를 하나 이상 추가해주세요.');
    return;
  }

  const info = {
    title,
    author,
    language: document.getElementById('book-language').value,
    publisher: document.getElementById('book-publisher').value.trim(),
    description: document.getElementById('book-description').value.trim()
  };

  const progressArea = document.getElementById('progress-area');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const generateBtn = document.getElementById('generate-btn');

  progressArea.style.display = 'block';
  generateBtn.disabled = true;
  generateBtn.style.opacity = '0.6';
  progressArea.scrollIntoView({ behavior: 'smooth', block: 'center' });

  try {
    const blob = await window.buildEpub(info, chapters, selectedStyle, selectedFontSize,
      (pct, msg) => {
        progressBar.style.width = pct + '%';
        progressText.textContent = msg;
      },
      coverFile
    );

    // 다운로드
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeTitle = title.replace(/[^a-zA-Z0-9가-힣\s]/g, '').replace(/\s+/g, '_');
    a.href = url;
    a.download = `${safeTitle || 'book'}.epub`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);

    progressText.textContent = '✓ 다운로드 완료! 파일이 저장되었습니다.';

  } catch (err) {
    console.error(err);
    progressText.textContent = '오류 발생: ' + err.message;
    progressBar.style.background = '#c94a3a';
  } finally {
    generateBtn.disabled = false;
    generateBtn.style.opacity = '1';
    setTimeout(() => {
      progressArea.style.display = 'none';
      progressBar.style.width = '0%';
      progressBar.style.background = '';
    }, 4000);
  }
});

// --- 기본 챕터 하나 추가 ---
addChapter('시작하며', '');
