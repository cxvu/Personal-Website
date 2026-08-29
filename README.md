# Natan — Personal Website

Halaman profil pribadi (link in bio) statis, dengan foto profil & nama yang
otomatis diambil dari akun Discord, kartu server Discord, dan kumpulan link
social media. Dibuat pakai HTML, CSS, dan JavaScript murni — tanpa build
tools, tanpa framework.

<p align="center">
  <img src="img/preview.jpg" alt="Preview tampilan Natan Bio Link" width="360">
</p>

## ✨ Fitur

- **Foto profil & nama otomatis dari Discord**, diambil real-time lewat
  [Lanyard API](https://github.com/Phineas/lanyard) (tidak perlu update manual).
- **Kartu server Discord** — menampilkan ikon, nama server, jumlah member,
  dan tombol **Join** yang mengarah ke invite server kamu.
- **Dark/Light mode otomatis**, mengikuti preferensi sistem, dengan opsi
  disimpan di `localStorage` biar tidak "kedip" saat reload.
- **Skeleton loading** — avatar, nama, dan kartu server menampilkan
  placeholder pulsing saat data masih dimuat, dan fade-in halus begitu siap.
- **Efek suara** saat klik di halaman.
- **Fallback avatar statis** kalau Discord API sedang tidak bisa diakses.
- Responsive — tampilan disesuaikan otomatis untuk mobile & desktop.

## 📁 Struktur folder

```
Natan/
├── index.html      # Struktur halaman (HTML)
├── style.css        # Semua styling & tema warna
├── script.js         # Logika: fetch data Discord, render avatar/kartu server, dll
├── img/
│   ├── Natan.jpg     # Foto profil fallback (statis)
│   ├── preview.jpg    # Screenshot preview untuk README
│   └── favicon.ico
└── audio/
    └── click.ogg     # Efek suara saat klik
```

## ⚙️ Cara konfigurasi

Semua pengaturan utama ada di bagian paling atas file **`script.js`**
(`CONFIG` dan `PERSON_INFO`). Tidak perlu sentuh bagian lain kalau cuma mau
ganti data.

### 1. Data akun Discord

```js
const PERSON_INFO = {
  discordId: "ISI_DENGAN_USER_ID_DISCORD_KAMU",
  discordServerId: "ISI_DENGAN_SERVER_ID_DISCORD_KAMU",
  discordInviteCode: "ISI_DENGAN_KODE_INVITE_KAMU", // bagian setelah discord.gg/
};
```

Cara mendapatkan ID & kode invite:
1. Buka **Discord → Settings → Advanced**, aktifkan **Developer Mode**.
2. Klik kanan foto profil kamu → **Copy User ID** → isi ke `discordId`.
   ID ini juga dipakai untuk link ikon Discord di social links
   (`https://discord.com/users/ID_KAMU`).
3. Klik kanan ikon server kamu → **Copy Server ID** → isi ke `discordServerId`.
4. Di salah satu channel, klik **Invite People** (atau klik kanan channel →
   Invite People) → buat/pilih invite yang **permanen**
   (Never Expire + Unlimited Uses) → salin kode setelah `discord.gg/` →
   isi ke `discordInviteCode`.

> ⚠️ **Penting:** kode invite harus permanen. Kalau expired/limited, kartu
> server akan menampilkan pesan error alih-alih data server.

Untuk kartu server bisa tampil, foto profil, dan nama otomatis muncul,
akun Discord kamu harus terdaftar di
**[Lanyard](https://github.com/Phineas/lanyard)** — caranya cukup join
[server Discord Lanyard](https://discord.gg/lanyard) sekali (tidak perlu
kirim pesan apa pun).

### 2. Tampilan avatar

```js
const CONFIG = {
  useDiscordAvatar: true,     // false = pakai gambar statis di img/Natan.jpg
  decorationInFront: true,    // posisi dekorasi avatar Discord (kalau ada)
  showStatus: false,          // tampilkan titik status online/idle/dnd
  avatarSize: 190,            // ukuran avatar di desktop (px)
  mobileAvatarSize: 150,      // ukuran avatar di mobile (px)
};
```

### 3. Link social media

Edit langsung di **`index.html`**, pada bagian `<!-- Social links -->`.
Cukup ganti nilai `href` di setiap tag `<a>` (urutan saat ini: GitHub →
Discord → Instagram → Portofolio):

```html
<a href="https://github.com/USERNAME_KAMU" ...>
<a href="https://discord.com/users/USER_ID_DISCORD_KAMU" ...>
<a href="https://instagram.com/USERNAME_KAMU" ...>
<a href="https://link-portofolio-kamu.com" ...>
```

Ikon Discord akan membuka halaman profil Discord kamu saat diklik
(lewat `discord.com/users/<id>` — otomatis membuka aplikasi Discord kalau
terinstal, atau versi web kalau tidak).

### 4. Judul & meta tag (SEO/preview link)

Kalau mau ganti judul tab browser atau preview saat link dibagikan (di
Discord/Twitter/WhatsApp dll), edit bagian `<head>` di **`index.html`**:
`<title>`, `og:title`, `og:description`, `twitter:title`, dan
`twitter:description`.

## 🚀 Menjalankan secara lokal

Karena halaman ini melakukan `fetch()` ke API eksternal, buka file lewat
local server (bukan `file://`) supaya tidak kena masalah CORS di beberapa
browser:

```bash
# dari dalam folder Natan/
python3 -m http.server 7700
# lalu buka http://localhost:7700 di browser
```

Atau pakai extension **Live Server** di VS Code.

## 🌐 Deploy ke GitHub Pages

1. Buat repository baru di GitHub, lalu upload semua isi folder `Natan/`
   (bukan foldernya, tapi isinya — `index.html` harus ada di root repo).
2. Buka **Settings → Pages** di repo tersebut.
3. Pada **Source**, pilih branch `main` dan folder `/ (root)`.
4. Simpan — situs akan online di `https://USERNAME.github.io/NAMA_REPO/`
   setelah beberapa menit.

Kalau mau pakai domain sendiri, tambahkan file `CNAME` berisi domain kamu
di root repo, lalu atur DNS-nya sesuai
[dokumentasi GitHub Pages](https://docs.github.com/pages).

## 🛠️ Teknologi yang dipakai

- HTML5 & CSS3 murni (tanpa framework)
- Vanilla JavaScript (tanpa dependency/build step)
- [Lanyard API](https://github.com/Phineas/lanyard) — data presence Discord
- [Discord API](https://discord.com/developers/docs/intro) — data invite server

## 📄 Lisensi

Bebas dipakai dan dimodifikasi untuk keperluan pribadi.
