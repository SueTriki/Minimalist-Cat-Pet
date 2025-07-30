// Floating Cat Element
const cat = document.createElement('img');
cat.id = 'floating-cat';
cat.style.position = 'fixed';
cat.style.left = '20px';
cat.style.top = '20px';
cat.style.width = '80px';
cat.style.height = '80px';
cat.style.cursor = 'grab';
cat.style.zIndex = '999999';
cat.style.userSelect = 'none';

document.body.appendChild(cat);
// Enhanced Dark Mode Detection
function checkDarkMode() {
  // System dark mode
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Page dark mode (expanded detection)
  const pageDark = 
    document.documentElement.classList.contains('dark') ||
    document.body.classList.contains('dark-mode') ||
    /dark/i.test(document.documentElement.getAttribute('data-theme') || '') ||
    /dark/i.test(document.body.getAttribute('data-theme') || '') ||
    document.documentElement.style.colorScheme === 'dark';
  
  const isDark = systemDark || pageDark;
  document.documentElement.classList.toggle('cat-dark-mode', isDark);
  console.log(isDark ? "Dark mode ✅" : "Light mode ❌");
}

// Initialize with better observation
function initDarkMode() {
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addListener(checkDarkMode);
  }
  
  const observer = new MutationObserver(checkDarkMode);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme', 'style']
  });
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class', 'data-theme']
  });
  
  checkDarkMode();
}

// Initialize when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDarkMode);
} else {
  initDarkMode();
}


// Cat State
let isStanding = true;
const affirmations = [
    "Move like a snake",
    "You look like a mess but damn you're kind of beautiful.",
    "Falling apart? Good. That means you're still trying.",
    "You're not broken — just a beautifully cracked masterpiece.",
    "Screw perfect. Be relentless instead.",
    "Pain's your fuel. Burn bright",
    "The world's ugly — so make your own damn sparkle.",
    "You're fighting demons? good, that means you're still in the fight.",
    "Productivity? Nah. Let's stare at the wall for 5 hours.",
    "You're the main character. I'm just here to look cute and judge.",
    "Stretch. Nap. World domination. In that order.",
    "If you're overwhelmed, pretend you're a cat. Knock something over and leave.",
    "Deadlines are imaginary. Like the dog's self-esteem.",
    "Imposter syndrome? I confidently sit in boxes I don't fit in.",
    "You don't need fixing. Just more sunbeams and snacks.",
    "Don't chase approval. Chase laser pointers.",
    "Every day is Caturday if you ignore the system."
];

// Image Loader with Fallback
function setCatImage() {
    console.log('Loading cat images...');
    const standingImg = chrome.runtime.getURL('images/standingcat.png');
    const sittingImg = chrome.runtime.getURL('images/sittingcat.png');
    
    cat.onerror = () => {
        console.error('Image failed to load!');
        cat.style.fontSize = '50px';
        cat.src = '';
        cat.textContent = isStanding ? '🐱' : '🐈';
    };
    
    cat.src = isStanding ? standingImg : sittingImg;
}

// Initialize
setCatImage();

// Draggable Logic
let isDragging = false;
let offsetX, offsetY;

cat.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    offsetX = e.clientX - cat.getBoundingClientRect().left;
    offsetY = e.clientY - cat.getBoundingClientRect().top;
    cat.style.cursor = 'grabbing';
    e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    cat.style.left = `${e.clientX - offsetX}px`;
    cat.style.top = `${e.clientY - offsetY}px`;
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    cat.style.cursor = 'grab';
});

// Click Handler
cat.addEventListener('click', (e) => {
    if (isDragging || e.button !== 0) return;
    
    isStanding = !isStanding;
    setCatImage();
    
    // Affirmation Bubble
    const bubble = document.createElement('div');
    bubble.className = 'affirmation-bubble';
    bubble.textContent = affirmations[Math.floor(Math.random() * affirmations.length)];
    
    const catRect = cat.getBoundingClientRect();
    bubble.style.left = `${catRect.left + catRect.width/2 - 40}px`;
    bubble.style.top = `${catRect.top - 40}px`;
    
    document.body.appendChild(bubble);
    setTimeout(() => bubble.remove(), 5000);
});