const MIN = 100;
const MAX = 999;
const pinInput = document.getElementById('pin');
const usernameInput = document.getElementById('username');
const sha256HashView = document.getElementById('sha256-hash');
const resultView = document.getElementById('result');

// Local storage functions
function store(key, value) {
  localStorage.setItem(key, value);
}
function retrieve(key) {
  return localStorage.getItem(key);
}
function clear() {
  localStorage.clear();
}

// Cookie functions
function setCookie(name, value, days = 7) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = 'expires=' + d.toUTCString();
  document.cookie = `${name}=${value};${expires};path=/`;
}
function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, val] = cookie.trim().split('=');
    if (key === name) return val;
  }
  return null;
}

// Generate a random integer between min and max
function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

// SHA256 hash function
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Get or generate SHA256 hash
async function getSHA256Hash() {
  let cached = retrieve('sha256');
  if (cached) return cached;

  const randomPin = getRandomArbitrary(MIN, MAX).toString();
  cached = await sha256(randomPin);
  store('sha256', cached);
  return cached;
}

// Main logic to compare input
async function test() {
  const pin = pinInput.value;
  const username = usernameInput.value.trim();

  if (!username) {
    resultView.innerHTML = '⚠️ Please enter a username';
    resultView.classList.remove('hidden');
    return;
  }

  setCookie('username', username);

  if (pin.length !== 3) {
    resultView.innerHTML = '💡 Not 3 digits';
    resultView.classList.remove('hidden');
    return;
  }

  const hashedPin = await sha256(pin);

  if (hashedPin === sha256HashView.innerHTML) {
    resultView.innerHTML = `🎉 Success, ${username}!`;
  } else {
    resultView.innerHTML = `❌ Failed, ${username}`;
  }

  resultView.classList.remove('hidden');
}

// Load hash and greet user
async function main() {
  const savedUsername = getCookie('username');
  if (savedUsername) {
    resultView.innerHTML = `👋 Welcome back, ${savedUsername}!`;
    resultView.classList.remove('hidden');
  }

  sha256HashView.innerHTML = 'Calculating...';
  const hash = await getSHA256Hash();
  sha256HashView.innerHTML = hash;
}

// Ensure only numeric and 3 digits for PIN
pinInput.addEventListener('input', (e) => {
  pinInput.value = e.target.value.replace(/\D/g, '').slice(0, 3);
});

// Attach click handler
document.getElementById('check').addEventListener('click', test);

// Run app
main();
