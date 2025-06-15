// Import Three.js from a CDN for the background effect
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

// === Three.js Scene Setup (Copied from main script for background) ===
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
        positions[i3] = (Math.random() - 0.5) * 1000;
        positions[i3 + 1] = (Math.random() - 0.5) * 1000;
        positions[i3 + 2] = (Math.random() - 0.5) * 1000;
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


// === Raffle Countdown Logic ===
function setupCountdown() {
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;
    
    // Set the date for the next raffle drawing
    // This calculates the first day of the next month
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    function updateCountdown() {
        const currentTime = new Date();
        const diff = targetDate - currentTime;

        if (diff <= 0) {
            // Handle what happens when the countdown is over
            daysEl.innerText = '00';
            hoursEl.innerText = '00';
            minutesEl.innerText = '00';
            secondsEl.innerText = '00';
            clearInterval(timerInterval);
            // Optionally, show a "Winner Announced!" message
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        // Add leading zeros if the number is less than 10
        daysEl.innerText = d < 10 ? '0' + d : d;
        hoursEl.innerText = h < 10 ? '0' + h : h;
        minutesEl.innerText = m < 10 ? '0' + m : m;
        secondsEl.innerText = s < 10 ? '0' + s : s;
    }

    const timerInterval = setInterval(updateCountdown, 1000);
    updateCountdown(); // Initial call to avoid 1-second delay
}


// === Mobile Menu Toggle (Copied from main script) ===
function setupMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const openIcon = document.getElementById('menu-icon-open');
    const closeIcon = document.getElementById('menu-icon-close');

    if (menuToggle && mobileMenu && openIcon && closeIcon) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('flex');
            openIcon.classList.toggle('hidden');
            closeIcon.classList.toggle('hidden');
        });

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

// === Header Scroll Effect (Copied from main script) ===
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


// === Initialize everything when the document is ready ===
document.addEventListener('DOMContentLoaded', () => {
    init3D();
    animate3D();
    setupCountdown();
    setupMobileMenu();
    setupHeaderScroll();
    loadWinnerList();
    setupPageTransitions(); // <-- Add this line
});

// In testing/raffle.js

async function loadWinnerList() {
    const listContainer = document.getElementById('past-winners-list');
    if (!listContainer) return;

    // --- No changes needed to the Sanity fetch logic ---
    const projectId = 'jbuh6e9h';
    const dataset = 'production';
    // This is the corrected line
    const query = encodeURIComponent('*[_type == "raffleWinner"] | order(winDate desc)');
    const url = `https://${projectId}.api.sanity.io/v2021-10-21/data/query/${dataset}?query=${query}`;

    try {
        const response = await fetch(url);
        const { result } = await response.json();

        listContainer.innerHTML = '';

        if (result && result.length > 0) {
            result.forEach((winner, index) => {
                const winnerItem = document.createElement('div');
                
                // 1. UPDATED STYLING FOR EACH WINNER ITEM
                // This creates a cleaner look with a border, designed to be inside the main glass card.
                // It adds a border to all items except the last one.
                let classes = 'pt-4';
                if (index > 0) {
                    classes += ' border-t border-zinc-700/50';
                }
                winnerItem.className = classes;

                // 2. UPDATED HTML STRUCTURE FOR EACH ITEM
                winnerItem.innerHTML = `
                    <p class="text-xl font-semibold text-white">${winner.name}</p>
                    <p class="text-sm text-violet-300">${winner.month}</p>
                `;

                listContainer.appendChild(winnerItem);
            });
        } else {
            listContainer.innerHTML = '<p class="text-zinc-400 text-center">Past winners will be shown here!</p>';
        }
    } catch (error) {
        console.error("Could not load winner list:", error);
        listContainer.innerHTML = '<p class="text-red-500 text-center">Error loading winner list.</p>';
    }
}

// Make sure you are calling the function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // ... your other functions
    loadWinnerList();
});
