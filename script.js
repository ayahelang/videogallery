let videoData = [];
let currentSearchQuery = '';
let currentCategory = 'all';

const galleryGrid = document.getElementById('galleryGrid');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const categoryFilter = document.getElementById('categoryFilter');
const videoCount = document.getElementById('videoCount');
const noResults = document.getElementById('noResults');

const videoModal = document.getElementById('videoModal');
const modalIframe = document.getElementById('modalIframe');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalCategory = document.getElementById('modalCategory');
const closeModalBtn = document.getElementById('closeModalBtn');

document.addEventListener('DOMContentLoaded', () => {
  loadVideoData();
  setupEventListeners();
});

// Mengambil data dari file videos.json
async function loadVideoData() {
  try {
    const response = await fetch('videos.json');
    if (!response.ok) {
      throw new Error(`Gagal memuat JSON: Status ${response.status}`);
    }
    videoData = await response.json();
    renderGallery();
  } catch (error) {
    console.error('Error:', error);
    videoCount.textContent = 'Gagal memuat data video.';
    galleryGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: #ef4444; padding: 2rem;">
        <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; margin-bottom: 1rem;"></i>
        <p>Gagal memuat <code>videos.json</code>. Pastikan file JSON berada di folder yang sama.</p>
      </div>
    `;
  }
}

function renderGallery() {
  const filteredVideos = videoData.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(currentSearchQuery) ||
                          video.description.toLowerCase().includes(currentSearchQuery) ||
                          video.author.toLowerCase().includes(currentSearchQuery);
    const matchesCategory = currentCategory === 'all' || video.category === currentCategory;
    return matchesSearch && matchesCategory;
  });

  galleryGrid.innerHTML = '';
  videoCount.textContent = `Menampilkan ${filteredVideos.length} dari ${videoData.length} video`;

  if (filteredVideos.length === 0) {
    noResults.style.display = 'block';
  } else {
    noResults.style.display = 'none';

    filteredVideos.forEach(video => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-thumbnail">
          <img src="https://img.youtube.com/vi/${video.id}/hqdefault.jpg" alt="${video.title}" loading="lazy">
          <div class="card-category-tag">${video.categoryName}</div>
          <div class="play-overlay">
            <div class="play-icon"><i class="fa-solid fa-play"></i></div>
          </div>
        </div>
        <div class="card-body">
          <h2 class="card-title">${video.title}</h2>
          <p class="card-desc">${video.description}</p>
          <div class="card-footer">
            <span><i class="fa-regular fa-user"></i> ${video.author}</span>
            <span class="watch-link">Tonton <i class="fa-solid fa-arrow-right"></i></span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => openModal(video));
      galleryGrid.appendChild(card);
    });
  }
}

function setupEventListeners() {
  searchInput.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value.toLowerCase().trim();
    clearSearchBtn.classList.toggle('visible', currentSearchQuery.length > 0);
    renderGallery();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    currentSearchQuery = '';
    clearSearchBtn.classList.remove('visible');
    searchInput.focus();
    renderGallery();
  });

  categoryFilter.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    renderGallery();
  });

  closeModalBtn.addEventListener('click', closeModal);
  videoModal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal.classList.contains('active')) closeModal();
  });
}

function openModal(video) {
  modalIframe.src = `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`;
  modalTitle.textContent = video.title;
  modalDescription.textContent = video.description;
  modalCategory.textContent = video.categoryName;
  videoModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  videoModal.classList.remove('active');
  modalIframe.src = '';
  document.body.style.overflow = '';
}
