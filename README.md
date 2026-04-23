# 📖 EPUB 메이커

텍스트를 입력하면 EPUB 전자책 파일로 변환해주는 웹 애플리케이션입니다.  
GitHub Pages에서 무료로 호스팅됩니다. 서버 없이 브라우저에서만 동작합니다.

## ✨ 기능

- 책 제목, 저자, 출판사 등 메타데이터 설정
- 챕터 단위로 텍스트 입력 (순서 변경, 삭제 가능)
- 4가지 스타일 테마 (클래식, 모던, 미니멀, 따뜻함)
- 폰트 크기 조절
- EPUB 3 표준 준수 파일 생성
- 브라우저에서 즉시 다운로드

## 🚀 GitHub Pages 배포 방법

### 1단계 — 저장소 생성

1. GitHub에서 새 저장소 생성 (예: `epub-maker`)
2. 이 프로젝트의 파일들을 모두 업로드하거나 `git push`

### 2단계 — GitHub Actions 설정

1. 저장소 → **Settings** → **Pages**
2. **Source**: `GitHub Actions` 선택
3. `.github/workflows/deploy.yml` 파일이 자동으로 배포를 실행합니다

### 3단계 — 배포 확인

`main` 브랜치에 push하면 자동으로 배포됩니다.  
배포 URL: `https://{username}.github.io/{repository-name}/`

## 📁 파일 구조

```
epub-maker/
├── index.html          # 메인 HTML
├── style.css           # 스타일시트
├── epub.js             # EPUB 생성 로직 (JSZip 사용)
├── app.js              # UI 인터랙션
├── README.md
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Pages 자동 배포
```

## 🛠 기술 스택

- HTML / CSS / Vanilla JavaScript
- [JSZip](https://stuk.github.io/jszip/) — ZIP/EPUB 파일 생성 (CDN)
- GitHub Pages — 무료 호스팅
- GitHub Actions — 자동 배포

## 📝 텍스트 마크업 규칙

챕터 내용 입력 시 사용 가능한 서식:

```
# 소제목 1
## 소제목 2

빈 줄은 단락을 구분합니다.
```

## 📜 라이선스

MIT License
