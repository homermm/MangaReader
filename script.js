class MangaReader {
    constructor() {
        this.currentPage = 1;
        this.seriesName = 'Haikyuu';  // New property
        this.chapterNumber = 1;  // New property
        this.chapterPath = `Chapters/${this.seriesName}/Cap ${this.chapterNumber}/`;
        this.pageFiles = [];
        
        // Elementos del DOM
        this.mangaImage = document.getElementById('mangaImage');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.currentPageSpan = document.getElementById('currentPage');
        this.totalPagesSpan = document.getElementById('totalPages');
        this.container = document.querySelector('.manga-container');
        this.cascadeBtn = document.getElementById('cascadeMode');
        this.themeToggle = document.getElementById('themeToggle');
        
        // Estado inicial
        this.zoom = 100;
        this.isDark = false;
        this.isCascadeMode = false;
        
        // Inicialización
        this.init();
        this.initTheme();
        this.initZoom();
        this.initCascadeMode();
    }

    async init() {
        try {
            // Crear un array con números del 1 al 20 (o el número que necesites)
            this.pageFiles = Array.from({ length: 20 }, (_, i) => 
                (i + 1).toString().padStart(2, '0') + '.jpg'
            );
            
            // Verificar qué archivos existen realmente
            const existingFiles = [];
            for (const file of this.pageFiles) {
                try {
                    const path = `${this.chapterPath}${file}`;
                    const response = await fetch(path, { method: 'HEAD' });
                    if (response.ok) {
                        existingFiles.push(file);
                    }
                } catch (error) {
                    console.log(`Archivo no encontrado: ${file}`);
                }
            }
            
            // Actualizar la lista de archivos con los que existen
            this.pageFiles = existingFiles;
            this.totalPages = this.pageFiles.length;
            console.log('Total páginas encontradas:', this.totalPages);
            this.totalPagesSpan.textContent = this.totalPages;
            
            if (this.totalPages > 0) {
                this.updatePage();
            }
            
            // Configurar eventos de navegación
            this.prevBtn.addEventListener('click', () => this.changePage(-1));
            this.nextBtn.addEventListener('click', () => this.changePage(1));
            
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight') this.changePage(1);
                if (e.key === 'ArrowLeft') this.changePage(-1);
            });
        } catch (error) {
            console.error('Error al cargar las páginas:', error);
        }
    }

    initTheme() {
        // Cargar tema guardado
        this.isDark = localStorage.getItem('darkMode') === 'true';
        this.updateTheme();

        // Evento para cambiar tema
        this.themeToggle.addEventListener('click', () => {
            this.isDark = !this.isDark;
            localStorage.setItem('darkMode', this.isDark);
            this.updateTheme();
        });
    }

    updateTheme() {
        document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light');
        this.themeToggle.textContent = this.isDark ? '☀️' : '🌙';
    }

    initZoom() {
        document.getElementById('zoomIn').addEventListener('click', () => this.handleZoom(10));
        document.getElementById('zoomOut').addEventListener('click', () => this.handleZoom(-10));
        document.getElementById('zoomReset').addEventListener('click', () => {
            this.zoom = 100;
            this.updateZoom();
        });
    }

    handleZoom(delta) {
        this.zoom = Math.min(Math.max(50, this.zoom + delta), 200);
        this.updateZoom();
    }

    updateZoom() {
        const images = document.querySelectorAll('.manga-page img');
        images.forEach(img => {
            img.style.width = `${this.zoom}%`;
        });
    }

    initCascadeMode() {
        this.cascadeBtn.addEventListener('click', () => {
            this.isCascadeMode = !this.isCascadeMode;
            if (this.isCascadeMode) {
                this.showCascadeMode();
            } else {
                this.showSingleMode();
            }
            this.cascadeBtn.classList.toggle('active');
        });
    }

    showCascadeMode() {
        // Ocultar botones de navegación
        this.prevBtn.style.display = 'none';
        this.nextBtn.style.display = 'none';
        
        // Crear y mostrar todas las imágenes
        this.pageFiles.forEach((file, index) => {
            if (index === 0) {
                // Usar la primera imagen existente
                this.mangaImage.src = `${this.chapterPath}${file}`;
            } else {
                // Crear nuevas imágenes para el resto
                const imgContainer = document.createElement('div');
                imgContainer.className = 'manga-page';
                
                const img = document.createElement('img');
                img.src = `${this.chapterPath}${file}`;
                img.alt = `Página ${index + 1}`;
                
                imgContainer.appendChild(img);
                this.container.appendChild(imgContainer);
            }
        });
    }

    showSingleMode() {
        // Mostrar botones de navegación
        this.prevBtn.style.display = 'block';
        this.nextBtn.style.display = 'block';
        
        // Eliminar todas las imágenes adicionales
        const images = this.container.querySelectorAll('.manga-page');
        Array.from(images).forEach((imgContainer, index) => {
            if (index > 0) { // Mantener solo la primera imagen
                imgContainer.remove();
            }
        });
        
        // Actualizar la imagen actual
        this.updatePage();
    }

    changePage(delta) {
        const newPage = this.currentPage + delta;
        
        if (newPage >= 1 && newPage <= this.totalPages) {
            this.currentPage = newPage;
            this.updatePage();
        }
    }

    updatePage() {
        const fileName = this.pageFiles[this.currentPage - 1];
        this.mangaImage.src = `${this.chapterPath}${fileName}`;
        this.currentPageSpan.textContent = this.currentPage;
        
        // Actualizar estado de los botones
        this.prevBtn.disabled = this.currentPage === 1;
        this.nextBtn.disabled = this.currentPage === this.totalPages;
    }
}

// Inicializar el lector cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new MangaReader();
});