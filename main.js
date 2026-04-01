// --- PUESTA A PUNTO DE RENDIMIENTO LOGICUBE ---

// --- MOBILE CHECK ---
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

// --- CUSTOM CURSOR (Desktop Only) ---
// Se inicializa primero para asegurar que nunca dejemos al usuario sin cursor si hay un error en AOS o Vanta
if (!isMobile) {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    // Re-enable if hidden by default
    if (cursorDot && cursorOutline) {
        cursorDot.style.display = 'block';
        cursorOutline.style.display = 'block';

        window.addEventListener('mousemove', function (e) {
            const posX = e.clientX;
            const posY = e.clientY;

            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            if (cursorOutline.animate) {
                cursorOutline.animate({
                    left: `${posX}px`,
                    top: `${posY}px`
                }, { duration: 150, fill: "forwards" });
            } else {
                cursorOutline.style.left = `${posX}px`;
                cursorOutline.style.top = `${posY}px`;
            }
        });

        const hoverables = document.querySelectorAll('a, button, .card-3d, .neon-card, .target-card, .holo-card, .portfolio-item-wrapper');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (el.closest('.portfolio-item-wrapper') || el.classList.contains('portfolio-item-wrapper')) {
                    cursorOutline.classList.add('portfolio-hover');
                    cursorOutline.setAttribute('data-text', 'VER PROYECTO');
                    cursorDot.style.opacity = '0';
                } else {
                    cursorOutline.classList.add('hovered');
                    cursorDot.classList.add('hovered');
                }
            });
            el.addEventListener('mouseleave', () => {
                if (el.closest('.portfolio-item-wrapper') || el.classList.contains('portfolio-item-wrapper')) {
                    cursorOutline.classList.remove('portfolio-hover');
                    cursorOutline.removeAttribute('data-text');
                    cursorDot.style.opacity = '1';
                } else {
                    cursorOutline.classList.remove('hovered');
                    cursorDot.classList.remove('hovered');
                }
            });
        });
    }
}

// Inicializar AOS
if (typeof AOS !== 'undefined') {
    AOS.init({ 
        duration: 800, 
        once: true,
        disable: 'mobile' // Lighthouse recommendation against layout reflows
    });
}

// --- PRELOADER ---
window.addEventListener('load', function () {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => { preloader.style.display = 'none'; }, 600);
    }
});

// --- SCROLL PROGRESS & PARALLAX (OPTIMIZADO) ---
let isScrolling = false;
window.addEventListener('scroll', function () {
    if (!isScrolling) {
        window.requestAnimationFrame(function () {
            let nav = document.querySelector('.navbar');
            if (nav) {
                if (window.pageYOffset > 50) nav.classList.add('nav-scrolled');
                else nav.classList.remove('nav-scrolled');
            }

            let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            let scrolled = (winScroll / height) * 100;
            let progressIndicator = document.getElementById("scroll-progress");
            if (progressIndicator) {
                progressIndicator.style.width = scrolled + "%";
            }

            // Parallax on Hero
            if (!isMobile) {
                let heroContent = document.querySelector('.hero-content');
                if (heroContent && winScroll < height * 0.5) {
                    heroContent.style.transform = `translateY(${winScroll * 0.4}px) translateZ(0)`;
                    heroContent.style.opacity = 1 - (winScroll / 500);
                }
            }
            isScrolling = false;
        });
        isScrolling = true;
    }
});

// --- SCROLL VIDEO ---
const scrollVideo = document.getElementById('scrollVideo');
if (scrollVideo) {
    let currentScrollY = 0;
    let targetTime = 0;
    window.addEventListener('scroll', () => { currentScrollY = window.scrollY; });

    function scrubVideo() {
        if (scrollVideo.readyState >= 2) {
            let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            if (height > 0) {
                let scrollPercent = currentScrollY / height;
                targetTime = Math.min(scrollVideo.duration * scrollPercent, scrollVideo.duration - 0.05);
                let diff = targetTime - scrollVideo.currentTime;
                // Solo actualizar frames si hay un cambio real para no colapsar el CPU
                if (Math.abs(diff) > 0.005) {
                    scrollVideo.currentTime += diff * 0.15;
                }
            }
        }
        requestAnimationFrame(scrubVideo);
    }
    requestAnimationFrame(scrubVideo);
}

// --- VANTA 3D NETWORK BACKGROUND ---
// Vanta and Three.js removed due to excessive CPU usage and True Blocking Time (TBT)

// --- ANIME.JS: ADVANCED CHOREOGRAPHY ---
window.addEventListener('DOMContentLoaded', () => {
    if (typeof anime === 'undefined') return;

    // 1. Hero Stagger Entrance & Isotipo Scale
    document.querySelectorAll('.hero-badge, .hero-isotipo-wrapper, .hero-subtitle, .hero-content .btn').forEach(el => el.style.opacity = '0');

    anime.timeline({ easing: 'easeOutExpo' })
        .add({
            targets: '.hero-badge, .hero-subtitle, .hero-content .btn',
            translateY: [40, 0],
            opacity: [0, 1],
            delay: anime.stagger(150, { start: 600 }),
            duration: 1200
        })
        .add({
            targets: '.hero-isotipo-wrapper',
            translateY: [40, 0],
            opacity: [0, 1],
            duration: 1200,
            complete: function () {
                // 2. Activamos la levitación por CSS una vez que JS termina su trabajo
                // Esto evita que Anime.js y CSS peleen por la propiedad 'transform'
                let isotipo = document.querySelector('.hero-isotipo-wrapper');
                if (isotipo) isotipo.classList.add('levitating');
            }
        }, '-=900');

    // 3. Wandering Blobs (Fluid continuous background movement - Only Destkop)
    function animateBlobs() {
        if (isMobile) return; // Prevent heavy reflows on mobile
        anime({
            targets: '.glow-blob',
            translateX: function () { return anime.random(-25, 25) + 'vw'; },
            translateY: function () { return anime.random(-25, 25) + 'vh'; },
            scale: function () { return anime.random(8, 12) / 10; },
            easing: 'easeInOutSine',
            duration: function () { return anime.random(6000, 12000); },
            complete: animateBlobs
        });
    }
    if (!isMobile) animateBlobs();

    // 4. Subtle Breathing Effect on Icons (Palpitar - Only Desktop)
    if (!isMobile) {
        anime({
            targets: '.icon-visual i, .target-icon-wrap i, #impacto .fs-1 i',
            scale: [0.9, 1.15],
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutSine',
            duration: 1200,
            delay: anime.stagger(200)
        });
    }
});

// --- CUSTOM JS MARQUEE FOR MANUAL + AUTO SCROLL ---
document.addEventListener('DOMContentLoaded', () => {
    const trackContainer = document.querySelector('.portfolio-marquee-container');
    if(!trackContainer) return;
    
    let isHoveredOrDragged = false;
    let animationId;
    let scrollSpeed = 1.5; // pixels per frame
    
    // Mouse enters (hover on desktop)
    trackContainer.addEventListener('mouseenter', () => isHoveredOrDragged = true);
    trackContainer.addEventListener('mouseleave', () => isHoveredOrDragged = false);
    
    // Pausar auto-scroll durante touch/arrastre/wheel
    trackContainer.addEventListener('touchstart', () => isHoveredOrDragged = true, {passive: true});
    trackContainer.addEventListener('touchend', () => {
        setTimeout(() => isHoveredOrDragged = false, 1000); // 1 sec delay before auto resumes
    });
    trackContainer.addEventListener('wheel', () => {
        isHoveredOrDragged = true;
        clearTimeout(trackContainer.wheelTimeout);
        trackContainer.wheelTimeout = setTimeout(() => isHoveredOrDragged = false, 1000);
    }, {passive: true});
    
    function autoScrollMarquee() {
        if (!isHoveredOrDragged) {
            trackContainer.scrollLeft += scrollSpeed;
            // Cuando llega a la mitad exacta de su contenido total (gap incluido)
            if (trackContainer.scrollLeft >= trackContainer.scrollWidth / 2) {
                trackContainer.scrollLeft = 0;
            }
        }
        animationId = requestAnimationFrame(autoScrollMarquee);
    }
    
    autoScrollMarquee();
});
