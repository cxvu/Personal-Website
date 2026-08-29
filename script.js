/* ============================================================
   SCRIPT.JS — Logika halaman profil
   ------------------------------------------------------------
   File ini mengatur:
   1. Ukuran avatar responsive (desktop vs mobile)
   2. Avatar statis (fallback kalau Discord API tidak dipakai/gagal)
   3. Fetch data akun Discord (avatar + nama tampilan) via Lanyard API
   4. Kartu server Discord (nama server, jumlah member, tombol Join)
   5. Efek suara saat klik
   6. Inisialisasi saat halaman dimuat

   Yang PERLU kamu ubah ada di bagian KONFIGURASI di bawah ini.
   ============================================================ */

/* ============================================================
   KONFIGURASI
   Ubah nilai-nilai di bawah ini sesuai kebutuhanmu.
   ============================================================ */
const CONFIG = {
  // true = pakai foto profil Discord asli (real-time, ambil dari Lanyard)
  // false = pakai gambar statis di img/Natan.jpg
  useDiscordAvatar: true,

  // Kalau pakai avatar Discord: true = dekorasi avatar tampil DI ATAS foto,
  // false = dekorasi tampil sebagai bingkai/ring di sekitar foto
  decorationInFront: true,

  // Tampilkan titik status (online/idle/dnd) di pojok avatar
  showStatus: false,

  // Ukuran avatar (dalam px) untuk layar besar & layar kecil (mobile)
  avatarSize: 190,
  mobileAvatarSize: 150,
};

const PERSON_INFO = {
  // ID akun Discord kamu (dipakai untuk ambil avatar & display name via
  // Lanyard, dan untuk link ikon Discord di social links)
  // Cara dapetin: Discord > Settings > Advanced > aktifkan Developer Mode,
  // lalu klik kanan foto profilmu > Copy User ID
  discordId: "304067207120289814",

  // ID server Discord kamu (klik kanan ikon server > Copy Server ID)
  discordServerId: "383323576859623424",

  // Kode invite server Discord kamu (bagian setelah "discord.gg/").
  // WAJIB pakai invite PERMANEN (Never Expire + Unlimited Uses),
  // kalau tidak, kartu server akan menampilkan pesan error.
  discordInviteCode: "MQGWykkSqv",
};

// Base URL Discord CDN, dipakai untuk membangun link avatar/icon server
const DISCORD_CDN = "https://cdn.discordapp.com";

/* ============================================================
   1) UKURAN AVATAR RESPONSIVE
   ============================================================ */
function currentAvatarSize() {
  return window.innerWidth < 640 ? CONFIG.mobileAvatarSize : CONFIG.avatarSize;
}

let lastAppliedAvatarSize = null;

function updateAvatarSize() {
  const holder = document.getElementById("avatarHolder");
  const size = currentAvatarSize();
  holder.style.height = size + "px";
  holder.style.minHeight = size + "px";
  holder.style.width = size + "px";
  return size;
}

/* Tampilkan skeleton (placeholder pulsing) di avatar, nama, dan
   kartu server SEBELUM data selesai di-fetch, supaya halaman
   tidak terlihat kosong/delay saat pertama kali dibuka */
function renderSkeletons() {
  const avatar = document.getElementById("profileAvatar");
  const nameEl = document.getElementById("personName");
  const serverWrap = document.getElementById("discordServer");

  if (avatar) avatar.innerHTML = `<div class="skeleton skeleton-avatar"></div>`;
  if (nameEl) nameEl.innerHTML = `<span class="skeleton skeleton-name"></span>`;
  if (serverWrap) serverWrap.innerHTML = `<div class="skeleton skeleton-card"></div>`;
}

/* ============================================================
   2) PROFILE AVATAR STATIS (fallback ke inisial kalau gambar gagal)
   ============================================================ */
function renderStaticAvatar() {
  const avatar = document.getElementById("profileAvatar");
  const size = currentAvatarSize();

  avatar.innerHTML = `<img id="profileAvatarImg" class="fade-in" src="img/Natan.jpg" alt="Profile Avatar" draggable="false">`;

  const img = document.getElementById("profileAvatarImg");
  img.addEventListener("error", () => {
    const nameEl = document.getElementById("personName");
    const currentName = (nameEl && nameEl.textContent.trim()) || "?";
    const initials = currentName
      .split(" ")
      .map((n) => n[0])
      .join("");
    avatar.innerHTML = `
      <div style="
        width:100%;height:100%;border-radius:9999px;
        display:flex;align-items:center;justify-content:center;
        background:linear-gradient(135deg,#6366f1,#9333ea);
        color:#fff;font-weight:600;
        font-size:${size * 0.4}px;
      ">${initials}</div>`;
  });
}

/* ============================================================
   3) DATA AKUN DISCORD (satu kali fetch dipakai bareng untuk avatar & nama,
   biar tidak ada request dobel yang bikin lama muncul)
   ============================================================ */
let cachedDiscordData = null;

async function fetchDiscordUserOnce() {
  if (!CONFIG.useDiscordAvatar) {
    renderStaticAvatar();
    return;
  }
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${PERSON_INFO.discordId}`);
    const json = await res.json();
    if (!json.success) throw new Error("Lanyard error");
    cachedDiscordData = json.data;
    renderDiscordAvatar();
    renderDiscordName();
  } catch (err) {
    console.error("Error fetching Discord user data:", err);
    renderStaticAvatar();
    const nameEl = document.getElementById("personName");
    if (nameEl) nameEl.textContent = "Guest";
  }
}

/* Render ulang avatar dari data yang sudah di-cache (dipanggil lagi saat resize,
   TANPA fetch ulang, supaya tidak ada delay tambahan) */
function renderDiscordAvatar() {
  if (!cachedDiscordData) return;
  const avatar = document.getElementById("profileAvatar");
  const size = currentAvatarSize();
  const d = cachedDiscordData;
  const du = d.discord_user;

  let avatarUrl;
  if (du.avatar) {
    avatarUrl = `${DISCORD_CDN}/avatars/${PERSON_INFO.discordId}/${du.avatar}.png?size=512`;
  } else {
    let index = 0;
    try {
      const idBig = BigInt(du.id || PERSON_INFO.discordId);
      index = Number((idBig >> BigInt(22)) % BigInt(6));
    } catch (e) {
      index = 0;
    }
    avatarUrl = `${DISCORD_CDN}/embed/avatars/${index}.png`;
  }

  const decorationUrl = du.avatar_decoration_data
    ? `${DISCORD_CDN}/avatar-decoration-presets/${du.avatar_decoration_data.asset}.png`
    : null;

  let html = `
    <div class="fade-in" style="position:relative;width:100%;height:100%;">
      <div style="position:absolute;overflow:hidden;border-radius:9999px;
        z-index:${CONFIG.decorationInFront ? 5 : 20};box-shadow:0 4px 12px rgba(0,0,0,0.1);
        top:${CONFIG.decorationInFront ? '8%' : '0'};left:${CONFIG.decorationInFront ? '8%' : '0'};
        width:${CONFIG.decorationInFront ? '84%' : '100%'};height:${CONFIG.decorationInFront ? '84%' : '100%'};">
        <img src="${avatarUrl}" alt="Discord avatar" draggable="false" style="width:100%;height:100%;object-fit:cover;border-radius:9999px;">
      </div>`;

  if (decorationUrl) {
    const decInset = CONFIG.decorationInFront ? size * 0.02 : size * 0.08;
    const scale = CONFIG.decorationInFront ? 1.0 : 1.2;
    const animClass = CONFIG.decorationInFront ? "float-animation" : "pulse-animation";
    html += `
      <div style="position:absolute;top:-${decInset}px;right:-${decInset}px;bottom:-${decInset}px;left:-${decInset}px;
        display:flex;align-items:center;justify-content:center;overflow:visible;
        z-index:${CONFIG.decorationInFront ? 25 : 10};transform:scale(${scale});pointer-events:none;">
        <img src="${decorationUrl}" alt="Avatar decoration" draggable="false" class="${animClass}" style="width:100%;height:100%;object-fit:contain;">
      </div>`;
  }

  if (CONFIG.showStatus) {
    const dotSize = Math.max(4, size * 0.15);
    const colorMap = { online: "#3ba55c", idle: "#faa61a", dnd: "#ed4245", streaming: "#5865f2" };
    const color = colorMap[d.discord_status] || "#747f8d";
    html += `
      <span style="position:absolute;bottom:2%;right:2%;border-radius:9999px;border:2px solid #fff;
        width:${dotSize}px;height:${dotSize}px;z-index:30;box-shadow:0 2px 4px rgba(0,0,0,0.2);
        background:${color};"></span>`;
  }

  html += `</div>`;
  avatar.innerHTML = html;
}

/* Render nama dari data yang sudah di-cache (tanpa fetch ulang) */
function renderDiscordName() {
  if (!cachedDiscordData) return;
  const nameEl = document.getElementById("personName");
  if (!nameEl) return;
  const du = cachedDiscordData.discord_user;
  nameEl.textContent = du.global_name || du.username;
  nameEl.classList.add("fade-in");
}

/* ============================================================
   4) KARTU SERVER DISCORD (menggantikan status Discord)
   Menampilkan: foto profil server, nama server, jumlah member,
   dan tombol Join. Pakai invite code langsung (PERSON_INFO.discordInviteCode)
   supaya tidak tergantung propagasi "instant_invite" dari widget.json,
   yang kadang lambat/gagal ke-generate walau setting sudah benar.
   ============================================================ */
async function loadDiscordServer() {
  const wrap = document.getElementById("discordServer");
  if (!wrap) return;

  try {
    const inviteCode = PERSON_INFO.discordInviteCode;
    if (!inviteCode) throw new Error("discordInviteCode belum diisi di script.js");

    const inviteRes = await fetch(
      `https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`
    );
    if (!inviteRes.ok) {
      throw new Error(
        `Invite tidak valid atau sudah kedaluwarsa (status ${inviteRes.status}). ` +
        `Buat invite baru yang permanen (Never expire, Unlimited uses).`
      );
    }
    const invite = await inviteRes.json();
    const guild = invite.guild || {};

    const serverName = guild.name || "Discord Server";
    const memberCountRaw = invite.approximate_member_count;
    const memberCount =
      typeof memberCountRaw === "number"
        ? memberCountRaw.toLocaleString("id-ID")
        : "?";
    const iconUrl = guild.icon
      ? `${DISCORD_CDN}/icons/${guild.id}/${guild.icon}.png?size=128`
      : null;
    const inviteUrl = `https://discord.gg/${inviteCode}`;

    wrap.innerHTML = `
      <div class="server-card-link fade-in">
        <div class="server-icon">
          ${
            iconUrl
              ? `<img src="${iconUrl}" alt="${escapeHtml(serverName)}" draggable="false">`
              : `<div class="server-icon-fallback">${escapeHtml(serverName.slice(0, 2).toUpperCase())}</div>`
          }
        </div>
        <div class="server-info">
          <span class="server-name">${escapeHtml(serverName)}</span>
          <span class="server-meta">${memberCount} Members</span>
        </div>
        <a href="${inviteUrl}" target="_blank" rel="noopener noreferrer" class="server-join-btn">Join</a>
      </div>`;
  } catch (err) {
    console.error("Error fetching Discord server info:", err);
    wrap.innerHTML = `<div class="server-card-error">${escapeHtml(err.message)}</div>`;
  }
}

/* Utilitas kecil: escape teks sebelum dimasukkan ke innerHTML,
   supaya nama server/user tidak bisa menyuntikkan HTML (XSS-safe) */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ============================================================
   5) SOUND EFFECT SAAT KLIK (tombol, link, dll)
   ============================================================ */
function setupClickSound() {
  const audio = document.getElementById("clickSound");
  let isPlaying = false;

  document.addEventListener("click", () => {
    if (!audio || isPlaying) return;
    isPlaying = true;
    audio.currentTime = 0;
    audio.play().catch((err) => console.error("Error playing sound:", err))
      .finally(() => {
        setTimeout(() => { isPlaying = false; }, 50);
      });
  });
}

/* ============================================================
   6) INISIALISASI
   Dijalankan sekali saat halaman selesai dimuat.
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  lastAppliedAvatarSize = updateAvatarSize();
  renderSkeletons();

  window.addEventListener("resize", () => {
    const newSize = currentAvatarSize();
    // Mobile browser suka trigger event "resize" saat address bar
    // muncul/hilang ketika scroll, padahal ukuran avatar sebenarnya
    // tidak berubah. Kalau ukurannya sama, skip render ulang supaya
    // avatar tidak berkedip/flicker saat scroll.
    if (newSize === lastAppliedAvatarSize) return;

    lastAppliedAvatarSize = updateAvatarSize();
    // Render ulang pakai data yang sudah ada di cache, TANPA fetch ulang
    if (CONFIG.useDiscordAvatar && cachedDiscordData) {
      renderDiscordAvatar();
    } else if (!CONFIG.useDiscordAvatar) {
      renderStaticAvatar();
    }
  });

  // Satu fetch untuk avatar + nama sekaligus (lebih cepat, tidak dobel request)
  fetchDiscordUserOnce();

  loadDiscordServer();
  setInterval(loadDiscordServer, 30000);

  setupClickSound();
});
