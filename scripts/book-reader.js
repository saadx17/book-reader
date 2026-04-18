document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const bookTitleEl = document.getElementById('book-title');
  const bookSubtitleEl = document.getElementById('book-subtitle');
  const chapterTitleEl = document.getElementById('chapter-title');
  const chapterDifferentiatorEl = document.getElementById('chapter-differentiator');
  const chapterBodyEl = document.getElementById('chapter-body');
  
  const progressBarFillEl = document.getElementById('progress-bar-fill');
  const progressTextEl = document.getElementById('progress-text');
  
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  
  const btnTheme = document.getElementById('btn-theme');
  const btnFontStyle = document.getElementById('btn-font-style');
  const btnFontInc = document.getElementById('btn-font-inc');
  const btnFontDec = document.getElementById('btn-font-dec');
  const btnChapters = document.getElementById('btn-chapters');
  
  const chaptersSidebar = document.getElementById('chapters-sidebar');
  const sidebarBackdrop = document.getElementById('sidebar-backdrop');
  const btnCloseSidebar = document.getElementById('btn-close-sidebar');
  const chaptersListEl = document.getElementById('chapters-list');
  
  const readerContent = document.getElementById('reader-content');

  // State
  let bookData = null;
  let currentChapterIndex = 0;
  let fontMultiplier = 1;
  const FONT_STEP = 0.1;

  const fontStyles = ['var(--font-vintage)', 'var(--font-modern)', 'var(--font-regular)'];
  const fontNames = ['FONT: VINTAGE', 'FONT: MODERN', 'FONT: REGULAR'];
  let currentFontIndex = 0;
  const urlParams = new URLSearchParams(window.location.search);
  const bookIdParam = urlParams.get('book') || 'book';

  // Fetch book data
  fetch(`data/${bookIdParam}.json`)
    .then(res => {
      if (!res.ok) throw new Error("Could not load book data.");
      return res.json();
    })
    .then(data => {
      bookData = data;
      initReader();
    })
    .catch(err => {
      console.error(err);
      bookTitleEl.innerText = "Error Loading Book";
      bookSubtitleEl.innerText = "Please ensure the book parameter is correct.";
    });

  function initReader() {
    bookTitleEl.innerText = bookData.title;
    
    // Check local storage for settings like theme and font size
    const savedTheme = localStorage.getItem('reader-theme');
    if (savedTheme === 'dark') {
      document.body.classList.replace('theme-light', 'theme-dark');
    }

    const savedFont = localStorage.getItem('reader-font-multiplier');
    if (savedFont) {
      fontMultiplier = parseFloat(savedFont);
      updateFontSize();
    }

    const savedFontStyleIndex = localStorage.getItem('reader-font-style-index');
    if (savedFontStyleIndex) {
      currentFontIndex = parseInt(savedFontStyleIndex, 10);
    }
    updateFontStyle();

    populateChaptersModal();
    renderChapter(0);
  }

  async function renderChapter(index) {
    if (!bookData || !bookData.chapters[index]) return;
    
    currentChapterIndex = index;
    const chapter = bookData.chapters[index];
    
    // Apply chapter subtitle to the book header area underneath the book title
    if (chapter.subtitle) {
      bookSubtitleEl.innerText = chapter.subtitle;
      bookSubtitleEl.style.display = 'block';
    } else {
      bookSubtitleEl.style.display = 'none';
      bookSubtitleEl.innerText = '';
    }
    
    chapterTitleEl.innerText = chapter.title;
    
    // Apply center alignment if specified in the JSON
    if (chapter.alignTitle) {
      chapterTitleEl.style.textAlign = chapter.alignTitle;
    } else {
      chapterTitleEl.style.textAlign = 'left';
    }

    // Add a differentiator line below the title if requested
    if (chapter.differentiator) {
      chapterDifferentiatorEl.style.display = 'block';
    } else {
      chapterDifferentiatorEl.style.display = 'none';
    }
    
    chapterBodyEl.innerHTML = "Loading...";
    
    try {
      if (chapter.file) {
        const response = await fetch(`data/${chapter.file}`);
        if (!response.ok) throw new Error("Chapter file not found.");
        const markdownText = await response.text();
        chapterBodyEl.innerHTML = marked.parse(markdownText);
      } else if (chapter.content) {
        // Fallback in case some books still use the old content structure
        chapterBodyEl.innerHTML = chapter.content;
      }
    } catch (err) {
      console.error(err);
      chapterBodyEl.innerHTML = "<p>Error loading chapter content.</p>";
    }
    
    // Update progress
    const totalChapters = bookData.chapters.length;
    const currentNum = index + 1;
    const progressPercent = (currentNum / totalChapters) * 100;
    
    progressTextEl.innerText = `${currentNum} of ${totalChapters}`;
    progressBarFillEl.style.width = `${progressPercent}%`;
    
    // Button states
    btnPrev.disabled = (index === 0);
    btnNext.disabled = (index === totalChapters - 1);
    
    // Update modal active state
    const allListBtns = chaptersListEl.querySelectorAll('button');
    allListBtns.forEach((btn, i) => {
      if(i === index) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function populateChaptersModal() {
    chaptersListEl.innerHTML = '';
    bookData.chapters.forEach((chapter, index) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.className = 'chapter-nav-btn';
      
      const numSpan = document.createElement('span');
      numSpan.className = 'chapter-num';
      numSpan.innerText = String(index + 1).padStart(2, '0');
      
      const detailsDiv = document.createElement('div');
      detailsDiv.className = 'chapter-details';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'chapter-name';
      titleSpan.innerText = chapter.title;

      detailsDiv.appendChild(titleSpan);

      if (chapter.subtitle) {
        const subSpan = document.createElement('span');
        subSpan.className = 'chapter-list-subtitle';
        subSpan.innerText = chapter.subtitle.substring(0, 40) + (chapter.subtitle.length > 40 ? '...' : '');
        detailsDiv.appendChild(subSpan);
      }

      btn.appendChild(numSpan);
      btn.appendChild(detailsDiv);

      btn.addEventListener('click', () => {
        renderChapter(index);
        closeSidebar();
      });
      li.appendChild(btn);
      chaptersListEl.appendChild(li);
    });
  }

  // Navigation handlers
  btnPrev.addEventListener('click', () => {
    if (currentChapterIndex > 0) renderChapter(currentChapterIndex - 1);
  });
  
  btnNext.addEventListener('click', () => {
    if (currentChapterIndex < bookData.chapters.length - 1) renderChapter(currentChapterIndex + 1);
  });

  // Sidebar Handlers
  btnChapters.addEventListener('click', openSidebar);
  btnCloseSidebar.addEventListener('click', closeSidebar);
  
  // Close sidebar when clicking backdrop outside
  sidebarBackdrop.addEventListener('click', closeSidebar);

  function openSidebar() {
    chaptersSidebar.classList.remove('hidden');
    sidebarBackdrop.classList.remove('hidden');
  }

  function closeSidebar() {
    chaptersSidebar.classList.add('hidden');
    sidebarBackdrop.classList.add('hidden');
  }

  // Theme Toggler
  btnTheme.addEventListener('click', () => {
    if (document.body.classList.contains('theme-light')) {
      document.body.classList.replace('theme-light', 'theme-dark');
      localStorage.setItem('reader-theme', 'dark');
    } else {
      document.body.classList.replace('theme-dark', 'theme-light');
      localStorage.setItem('reader-theme', 'light');
    }
  });

  // Font Size Adjustments
  btnFontInc.addEventListener('click', () => {
    if(fontMultiplier < 2) {
      fontMultiplier += FONT_STEP;
      updateFontSize();
    }
  });

  btnFontDec.addEventListener('click', () => {
    if(fontMultiplier > 0.6) {
      fontMultiplier -= FONT_STEP;
      updateFontSize();
    }
  });

  function updateFontSize() {
    readerContent.style.setProperty('--font-multiplier', fontMultiplier);
    localStorage.setItem('reader-font-multiplier', fontMultiplier.toFixed(1));
  }

  // Font Style Adjustments
  btnFontStyle.addEventListener('click', () => {
    currentFontIndex = (currentFontIndex + 1) % fontStyles.length;
    updateFontStyle();
  });

  function updateFontStyle() {
    btnFontStyle.innerText = fontNames[currentFontIndex];
    document.documentElement.style.setProperty('--reader-font-family', fontStyles[currentFontIndex]);
    localStorage.setItem('reader-font-style-index', currentFontIndex.toString());
  }
});