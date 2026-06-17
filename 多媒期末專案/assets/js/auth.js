const Auth = (() => {

  const USERS_KEY   = 'aura_users';
  const SESSION_KEY = 'aura_session';

  // 讀取所有會員 
  function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  }

  //  儲存所有會員
  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  // 取得目前登入的使用者物件
  function currentUser() {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  // 是否已登入
  function isLoggedIn() {
    return currentUser() !== null;
  }

  //  註冊 
  function register({ name, email, password }) {
    const users = getUsers();
    const emailLower = email.trim().toLowerCase();

    if (users.find(u => u.email === emailLower)) {
      return { ok: false, msg: '此 Email 已被註冊，請直接登入。' };
    }

    users.push({ name: name.trim(), email: emailLower, password });
    saveUsers(users);
    return { ok: true };
  }

  // 登入
  // 回傳 { ok: true } 或 { ok: false, msg: '...' }
  function login({ email, password }) {
    const users = getUsers();
    const emailLower = email.trim().toLowerCase();
    const user = users.find(u => u.email === emailLower && u.password === password);

    if (!user) {
      alert("帳號或密碼錯誤!");
      return { ok: false};
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user)); 
    return { ok: true, user };
  }

  // 登出 
  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  //  要求登入
  function requireLogin() {
    return isLoggedIn();
  }

  //動態更新 Navbar
  function updateNavbar(rootPath = '') {
    const memberLi = document.querySelector('.nav-member-li');
    if (!memberLi) return;

    const user = currentUser();
    if (user) {
      memberLi.innerHTML = `
        <a href="${rootPath}pages/Personal.html"><span class="nav-username"><i class="fas fa-user-check"></i> ${user.name}</span></a>
        <button class="nav-logout-btn" id="navLogoutBtn">登出</button>
      `;
      document.getElementById('navLogoutBtn').addEventListener('click', () => {
        logout();
        window.location.href = rootPath + 'index.html';
      });
    } else {
      memberLi.innerHTML = `<a href="${rootPath}pages/Login.html"><i class="fas fa-user"></i> 登入 / 註冊</a>`;
    }
  }

  //更新購物車數字
  function updateCartCount() {
    const cart  = JSON.parse(localStorage.getItem("auraCart") || "[]");
    const total = cart.reduce((sum, i) => sum + (i.qty || 0), 0);
    document.querySelectorAll(".cart-count").forEach(el => el.textContent = total);
  }

  return { getUsers, currentUser, isLoggedIn, register, login, logout, requireLogin, updateNavbar, updateCartCount };
})();

document.getElementById('show-pwd-btn').addEventListener('click', function() {
    const user = Auth.currentUser();
    const pwdDisplay = document.getElementById('display-pwd');
    
    if (pwdDisplay.textContent !== "********") {
        pwdDisplay.textContent = "********";
        this.textContent = "顯示密碼";
        return;
    }

    const input = prompt("為了您的帳戶安全，請再次輸入您的密碼以確認身份：");
    
    if (input === user.password) {
        pwdDisplay.textContent = user.password; 
        this.textContent = "隱藏密碼";
    } else if (input !== null) {
        alert("密碼錯誤，請重新嘗試。");
    }
});