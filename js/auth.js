// Garden — shared auth/UI helpers

function toast(msg, ms = 2600) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), ms);
}

// Redirect to login if not signed in. Calls cb(user) once known.
function requireAuth(cb) {
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = 'login.html';
    } else {
      cb(user);
    }
  });
}

// If already signed in, bounce away from login/signup to the dashboard.
function redirectIfSignedIn() {
  auth.onAuthStateChanged(user => {
    if (user) window.location.href = 'index.html';
  });
}

function signOutAndRedirect() {
  auth.signOut().then(() => window.location.href = 'login.html');
}

function authErrorMessage(err) {
  const map = {
    'auth/email-already-in-use': 'That email is already registered.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/user-not-found': 'No account found with that email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/too-many-requests': 'Too many attempts. Try again shortly.'
  };
  return map[err.code] || err.message || 'Something went wrong.';
}

function setButtonLoading(btn, loading, label) {
  if (loading) {
    btn.dataset.label = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span> ' + (label || 'Please wait');
    btn.disabled = true;
  } else {
    btn.innerHTML = btn.dataset.label || label || 'Continue';
    btn.disabled = false;
  }
}
