document.addEventListener("DOMContentLoaded", async () => {
    const galleryGrid = document.querySelector("#gallery-grid");

    const lightbox = document.querySelector("#lightbox");
    const lightboxImage = document.querySelector("#lightbox-image");
    const lightboxCaption = document.querySelector("#lightbox-caption");
    const closeBtn = document.querySelector("#lightbox-close");
    const prevBtn = document.querySelector("#lightbox-prev");
    const nextBtn = document.querySelector("#lightbox-next");

    let images = [];
    let currentIndex = 0;

    const getGalleryItems = async () => {
        const response = await fetch("./assets/data/gallery.json");

        if (!response.ok) {
            throw new Error(`Nie udało się wczytać galerii. Status: ${response.status}`);
        }

        return response.json();
    };

    const createGalleryItem = ({ src, alt, caption, width, height }) => `
        <figure class="gallery-item">
            <img
                src="${src}"
                width="${width}"
                height="${height}"
                loading="lazy"
                decoding="async"
                alt="${alt}"
                class="gallery-image"
            >
            <figcaption>${caption}</figcaption>
        </figure>
    `;

    const renderGallery = (galleryItems) => {
        galleryGrid.innerHTML = galleryItems
            .map(createGalleryItem)
            .join("");

        images = [...document.querySelectorAll(".gallery-image")];

        images.forEach((image, index) => {
            image.addEventListener("click", () => openLightbox(index));
        });
    };

    const showImage = (index) => {
        const image = images[index];

        if (!image) return;

        const caption = image.nextElementSibling;

        lightboxImage.src = image.src;
        lightboxImage.alt = image.alt;
        lightboxCaption.textContent = caption?.textContent ?? "";

        currentIndex = index;
    };

    const openLightbox = (index) => {
        showImage(index);
        lightbox.classList.add("active");
        document.body.style.overflow = "hidden";
    };

    const closeLightbox = () => {
        lightbox.classList.remove("active");
        document.body.style.overflow = "";
    };

    const showNext = () => {
        if (!images.length) return;

        currentIndex = (currentIndex + 1) % images.length;
        showImage(currentIndex);
    };

    const showPrev = () => {
        if (!images.length) return;

        currentIndex = (currentIndex - 1 + images.length) % images.length;
        showImage(currentIndex);
    };

    const handleLightboxClick = ({ target }) => {
        if (target === lightbox) {
            closeLightbox();
        }
    };

    const handleKeydown = ({ key }) => {
        if (!lightbox.classList.contains("active")) return;

        const actions = {
            Escape: closeLightbox,
            ArrowRight: showNext,
            ArrowLeft: showPrev,
        };

        actions[key]?.();
    };

    const initGallery = async () => {
        try {
            const galleryItems = await getGalleryItems();
            renderGallery(galleryItems);
        } catch (error) {
            console.error(error);
            galleryGrid.innerHTML = "<p>Nie udało się załadować galerii.</p>";
        }
    };

    closeBtn.addEventListener("click", closeLightbox);
    nextBtn.addEventListener("click", showNext);
    prevBtn.addEventListener("click", showPrev);
    lightbox.addEventListener("click", handleLightboxClick);
    document.addEventListener("keydown", handleKeydown);

    await initGallery();
});