// Import Three.js from a CDN
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

// === Three.js Scene Setup ===
let scene, camera, renderer, particles;
let mouseX = 0, mouseY = 0;

const container = document.getElementById('canvas-container');

function init3D() {
    if (!container) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 300; 

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 1000; // x
        positions[i3 + 1] = (Math.random() - 0.5) * 1000; // y
        positions[i3 + 2] = (Math.random() - 0.5) * 1000; // z
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.8,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.6
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    if (!renderer || !camera) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - (window.innerWidth / 2));
    mouseY = (event.clientY - (window.innerHeight / 2));
}

function animate3D() {
    requestAnimationFrame(animate3D);
    if (!particles || !camera || !scene || !renderer) return;

    particles.rotation.y += 0.00015;

    camera.position.x += (mouseX * 0.0005 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 0.0005 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);
    
    renderer.render(scene, camera);
}

// === Mobile Menu Toggle ===
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const openIcon = document.getElementById('menu-icon-open');
const closeIcon = document.getElementById('menu-icon-close');

function setupMobileMenu() {
    if (menuToggle && mobileMenu && openIcon && closeIcon) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('flex'); // Use flex to enable centering
            openIcon.classList.toggle('hidden');
            closeIcon.classList.toggle('hidden');
        });

        // Close menu when a link is clicked
        mobileMenu.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('flex');
                openIcon.classList.remove('hidden');
                closeIcon.classList.add('hidden');
            }
        });
    }
}

// === Animated Counter Logic ===
const counter = document.getElementById('member-count');
let animationStarted = false;

const startCounterAnimation = () => {
    if (!counter) return;
    const goal = parseInt(counter.dataset.goal);
    const duration = 2000; // 2 seconds
    let startTimestamp = null;

    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentCount = Math.floor(progress * goal);
        
        if (progress >= 1) {
            counter.innerText = `${goal.toLocaleString()}+`;
        } else {
            counter.innerText = currentCount.toLocaleString();
        }

        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
};

// === Scroll Animations & Counter Trigger ===
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Trigger counter animation only once when it becomes visible
                if (entry.target.id === 'discord-counter-section' && !animationStarted) {
                    startCounterAnimation();
                    animationStarted = true;
                }
            }
        });
    }, { threshold: 0.2 }); // Lowered threshold to trigger a bit earlier

    const elementsToObserve = document.querySelectorAll('.scroll-reveal');
    elementsToObserve.forEach(el => observer.observe(el));
}


// === Header Scroll Effect ===
function setupHeaderScroll() {
    const header = document.getElementById('main-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                header.classList.add('glass-effect');
                header.classList.add('shadow-lg');
            } else {
                header.classList.remove('glass-effect');
                header.classList.remove('shadow-lg');
            }
        });
    }
}


// === Bet Preview Modal Logic ===
function setupBetModal() {
    const betCards = document.querySelectorAll('.bet-card');
    const modal = document.getElementById('bet-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalOdds = document.getElementById('modal-odds');
    const modalStatus = document.getElementById('modal-status');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    function showModal(card) {
        if (!modal || !card) return;

        const image = card.querySelector('.bet-image')?.src;
        const title = card.querySelector('.bet-title')?.innerText;
        const desc = card.querySelector('.bet-desc')?.innerText;
        const odds = card.querySelector('.bet-odds');
        const status = card.querySelector('.bet-status');

        if(modalImage) modalImage.src = image || '';
        if(modalTitle) modalTitle.innerText = title || 'N/A';
        if(modalDesc) modalDesc.innerText = desc || 'N/A';
        if(modalOdds && odds) {
             modalOdds.innerText = odds.innerText;
             modalOdds.className = odds.className + ' text-xl font-bold';
        }
        if(modalStatus && status) {
            modalStatus.innerText = status.innerText;
            modalStatus.className = status.className + ' text-sm font-semibold py-1 px-3 rounded-full';
        }

        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('visible'), 10);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    function hideModal() {
        if (!modal) return;
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = ''; // Restore scrolling
        }, 300);
    }

    if(betCards.length > 0 && modal) {
        betCards.forEach(card => {
            card.addEventListener('click', () => showModal(card));
        });

        if (modalCloseBtn) modalCloseBtn.addEventListener('click', hideModal);
        if (modalOverlay) modalOverlay.addEventListener('click', hideModal);
    }
}

// === Initialize everything when the document is ready ===
document.addEventListener('DOMContentLoaded', () => {
    init3D();
    animate3D();
    setupMobileMenu();
    setupScrollAnimations();
    setupHeaderScroll();
    setupBetModal();
    setupPageTransitions(); // <-- Add this line
});

// === Page Transition Logic (with Failsafe) ===
function setupPageTransitions() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    // A function to reliably hide the preloader
    const hidePreloader = () => {
        preloader.classList.add('preloader-hidden');
    };

    // Hide the preloader when the page is fully loaded
    window.addEventListener('load', hidePreloader);

    // Failsafe: If the page takes more than 3 seconds to load, hide
    // the preloader anyway. This prevents the user from getting stuck.
    setTimeout(hidePreloader, 3000);

    // Intercept link clicks to fade in preloader before navigating
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        // Check if the link is for a local page
        const isLocalLink = link.href.includes(window.location.hostname) || !link.href.startsWith('http');

        // Exclude links that open in new tabs or are just anchors on the current page
        if (link.target === '_blank' || (href && href.startsWith('#')) || !isLocalLink) {
            return;
        }

        link.addEventListener('click', (e) => {
            // Prevent the browser from navigating immediately
            e.preventDefault();
            const destination = link.href;

            // Make the preloader visible again
            preloader.classList.remove('preloader-hidden');

            // Wait for the fade-in animation to finish, then navigate
            setTimeout(() => {
                window.location.href = destination;
            }, 500); // This duration should match the CSS transition
        });
    });
}

// --- Timeline Animation Trigger ---
document.addEventListener('DOMContentLoaded', () => {

    const timelineSection = document.getElementById('timeline-section');

    if (timelineSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add the 'is-visible' class to trigger the CSS animations
                    timelineSection.classList.add('is-visible');
                    // Stop observing after the animation has run once
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3 // Trigger when 30% of the element is visible
        });

        observer.observe(timelineSection);
    }
});
