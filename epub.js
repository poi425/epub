// epub.js — EPUB 3 파일 생성 로직

const EPUB_STYLES = {
  classic: `
    body { font-family: 'Georgia', 'Batang', serif; background: #f5f0e8; color: #2c2416; margin: 2em 3em; line-height: 1.85; text-align: justify; word-break: keep-all; }
    h1 { font-size: 2em; font-weight: 700; color: #1a0e00; border-bottom: 2px solid #8b6940; padding-bottom: 0.4em; margin-bottom: 1.2em; text-align: center; }
    h2 { font-size: 1.5em; font-weight: 600; color: #2c1e0a; margin: 1.5em 0 0.8em; text-align: left; }
    p { margin: 0 0 1.1em; text-indent: 1.5em; }
    p:first-of-type { text-indent: 0; }
  `,
  modern: `
    body { font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', -apple-system, sans-serif; background: #ffffff; color: #1a1a1a; margin: 2em 3em; line-height: 1.8; text-align: justify; word-break: keep-all; }
    h1 { font-size: 1.9em; font-weight: 700; color: #000; margin-bottom: 1.2em; text-align: center; }
    h2 { font-size: 1.4em; font-weight: 600; color: #222; margin: 1.5em 0 0.8em; text-align: left; }
    p { margin: 0 0 1em; }
  `,
  minimal: `
    body { font-family: 'Helvetica Neue', 'Apple SD Gothic Neo', sans-serif; background: #f9f9f9; color: #111; margin: 2em 4em; line-height: 2; text-align: justify; word-break: keep-all; }
    h1 { font-size: 1.8em; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; border-left: 5px solid #111; padding-left: 0.8em; margin-bottom: 1.5em; text-align: left; }
    h2 { font-size: 1.2em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #333; margin: 2em 0 0.6em; text-align: left; }
    p { margin: 0 0 1em; }
  `,
  warm: `
    body { font-family: 'Georgia', 'Batang', serif; background: #fdf6ec; color: #3e2a15; margin: 2.5em 3.5em; line-height: 2; text-align: justify; word-break: keep-all; }
    h1 { font-size: 2em; font-weight: 700; color: #5c3b1e; text-align: center; margin-bottom: 1.5em; }
    h2 { font-size: 1.4em; font-weight: 600; color: #7c5d42; margin: 2em 0 0.8em; text-align: left; }
    p { margin: 0 0 1.2em; text-indent: 2em; }
    p:first-of-type { text-indent: 0; }
  `
};

const FONT_SIZES = { small: '14px', medium: '16px', large: '19px' };

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function textToHtmlParagraphs(text) {
  return text.trim().split(/\n+/).map(p => {
    const t = p.trim();
    if (!t) return '';
    if (t.startsWith('# ')) return `<h2>${escapeHtml(t.slice(2))}</h2>`;
    if (t.startsWith('## ')) return `<h3>${escapeHtml(t.slice(3))}</h3>`;
    return `<p>${escapeHtml(t)}</p>`;
  }).join('\n');
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function makeChapterXhtml(title, content, styleKey, fontSize) {
  const css = (EPUB_STYLES[styleKey] || EPUB_STYLES.modern)
    .replace(/font-size:[^;]+;/g, '')
    + `\nbody { font-size: ${FONT_SIZES[fontSize] || '16px'}; }`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ko" lang="ko">
<head>
  <meta charset="UTF-8"/>
  <title>${escapeHtml(title)}</title>
  <style>
${css}
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${textToHtmlParagraphs(content)}
</body>
</html>`;
}

function makeTitlePageXhtml(info, styleKey, fontSize) {
  const css = (EPUB_STYLES[styleKey] || EPUB_STYLES.modern)
    + `\nbody { font-size: ${FONT_SIZES[fontSize] || '16px'}; text-align: center; }`;
  const desc = info.description ? `<p style="margin-top:2em; text-align:left;">${escapeHtml(info.description)}</p>` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ko" lang="ko">
<head>
  <meta charset="UTF-8"/>
  <title>${escapeHtml(info.title)}</title>
  <style>
${css}
.title-page { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; }
.book-title { font-size: 2.5em; font-weight: 700; margin-bottom: 0.5em; }
.book-author { font-size: 1.2em; opacity: 0.75; }
.book-publisher { font-size: 0.9em; margin-top: 2em; opacity: 0.5; }
  </style>
</head>
<body>
  <div class="title-page">
    <div class="book-title">${escapeHtml(info.title)}</div>
    <div class="book-author">${escapeHtml(info.author)}</div>
    ${info.publisher ? `<div class="book-publisher">${escapeHtml(info.publisher)}</div>` : ''}
    ${desc}
  </div>
</body>
</html>`;
}

function makeContainerXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
}

function makeContentOpf(info, chapters, uid, hasCover, coverExt, coverMime) {
  const manifest = chapters.map((ch, i) =>
    `    <item id="ch${i}" href="chapter${i}.xhtml" media-type="application/xhtml+xml"/>`
  ).join('\n');

  const spine = chapters.map((ch, i) =>
    `    <itemref idref="ch${i}"/>`
  ).join('\n');

  const now = new Date().toISOString().split('.')[0] + 'Z';
  const coverManifest = hasCover ? `
    <item id="cover-img" href="cover.${coverExt}" media-type="${coverMime}" properties="cover-image"/>
    <item id="cover-page" href="cover.xhtml" media-type="application/xhtml+xml"/>` : '';
  const coverSpine = hasCover ? `    <itemref idref="cover-page" linear="yes"/>` : '';
  const coverMeta = hasCover ? `\n    <meta name="cover" content="cover-img"/>` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">${uid}</dc:identifier>
    <dc:title>${escapeHtml(info.title)}</dc:title>
    <dc:creator>${escapeHtml(info.author)}</dc:creator>
    <dc:language>${info.language || 'ko'}</dc:language>
    ${info.publisher ? `<dc:publisher>${escapeHtml(info.publisher)}</dc:publisher>` : ''}
    ${info.description ? `<dc:description>${escapeHtml(info.description)}</dc:description>` : ''}
    <meta property="dcterms:modified">${now}</meta>${coverMeta}
  </metadata>
  <manifest>
    <item id="toc" href="toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="title" href="chapter_title.xhtml" media-type="application/xhtml+xml"/>${coverManifest}
${manifest}
  </manifest>
  <spine>
${coverSpine}
    <itemref idref="title"/>
    <itemref idref="toc"/>
${spine}
  </spine>
</package>`;
}

function makeTocXhtml(info, chapters, styleKey) {
  const items = chapters.slice(1).map((ch, i) =>
    `      <li><a href="chapter${i + 1}.xhtml">${escapeHtml(ch.title)}</a></li>`
  ).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" epub:prefix="epub: http://www.idpf.org/2007/ops" xml:lang="ko" lang="ko">
<head>
  <meta charset="UTF-8"/>
  <title>목차</title>
  <style>
    body { font-family: sans-serif; margin: 2em 3em; }
    h1 { font-size: 1.8em; margin-bottom: 1em; }
    nav ol { list-style: none; padding: 0; }
    nav li { margin: 0.5em 0; }
    nav a { text-decoration: none; color: inherit; font-size: 1em; }
    nav a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>목차</h1>
  <nav epub:type="toc" id="toc">
    <ol>
${items}
    </ol>
  </nav>
</body>
</html>`;
}

function makeCoverPageXhtml(mimeType) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ko" lang="ko">
<head>
  <meta charset="UTF-8"/>
  <title>표지</title>
  <style>
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; }
    img { display: block; width: 100%; height: 100%; object-fit: cover; }
  </style>
</head>
<body>
  <img src="cover.${mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg'}" alt="표지"/>
</body>
</html>`;
}

async function buildEpub(info, chapters, styleKey, fontSize, onProgress, coverFile) {
  const zip = new JSZip();
  const uid = generateUUID();

  onProgress(5, 'EPUB 구조 생성 중...');
  zip.file('mimetype', 'application/epub+zip');
  zip.file('META-INF/container.xml', makeContainerXml());

  // Cover image
  let hasCover = false;
  let coverMime = 'image/jpeg';
  let coverExt = 'jpg';
  if (coverFile) {
    try {
      onProgress(12, '표지 이미지 처리 중...');
      coverMime = coverFile.type || 'image/jpeg';
      coverExt = coverMime === 'image/png' ? 'png' : coverMime === 'image/webp' ? 'webp' : 'jpg';
      const coverData = await coverFile.arrayBuffer();
      zip.file(`OEBPS/cover.${coverExt}`, coverData);
      zip.file('OEBPS/cover.xhtml', makeCoverPageXhtml(coverMime));
      hasCover = true;
    } catch(e) { console.warn('Cover error:', e); }
  }

  onProgress(20, '타이틀 페이지 생성 중...');
  zip.file('OEBPS/chapter_title.xhtml', makeTitlePageXhtml(info, styleKey, fontSize));

  const allChapters = [{ title: info.title, content: '' }, ...chapters];

  onProgress(30, '목차 생성 중...');
  zip.file('OEBPS/toc.xhtml', makeTocXhtml(info, allChapters, styleKey));

  const total = chapters.length;
  for (let i = 0; i < total; i++) {
    const pct = 30 + Math.round(((i + 1) / total) * 50);
    onProgress(pct, `챕터 ${i + 1}/${total} 처리 중...`);
    zip.file(`OEBPS/chapter${i + 1}.xhtml`,
      makeChapterXhtml(chapters[i].title, chapters[i].content, styleKey, fontSize));
    await new Promise(r => setTimeout(r, 20));
  }

  onProgress(85, 'OPF 메타데이터 작성 중...');
  zip.file('OEBPS/content.opf', makeContentOpf(info, allChapters, uid, hasCover, coverExt, coverMime));

  onProgress(92, 'EPUB 압축 중...');
  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/epub+zip',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
    streamFiles: false
  });

  onProgress(100, '완료!');
  return blob;
}

window.buildEpub = buildEpub;
