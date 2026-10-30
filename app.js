const categories = [
  {
    slug: "events",
    title: "Events",
    description: "Celebrations, gatherings, and the moments in between.",
    pageDescription: "Photographs of the people, atmosphere, and small moments that make a gathering memorable."
  },
  {
    slug: "branding",
    title: "Branding",
    description: "People, products, and the story behind a business.",
    pageDescription: "Thoughtful images that bring a business, its people, and its work into focus."
  },
  {
    slug: "couples-family",
    title: "Couples & Family",
    description: "Relaxed portraits of the people closest to you.",
    pageDescription: "Warm, natural photographs of couples, families, and the connections they share."
  },
  {
    slug: "studio-portraits",
    title: "Studio Portraits",
    description: "Simple, considered portraits made in the studio.",
    pageDescription: "Studio portraits with a calm setting and a natural feel."
  },
  {
    slug: "products",
    title: "Products",
    description: "Clear, characterful images of the details that matter.",
    pageDescription: "Product photographs that show the form, finish, and small details of your work."
  }
];

const main = document.querySelector("#main");
const nav = document.querySelector("#site-nav");
const menuToggle = document.querySelector(".menu-toggle");
const lightbox = document.querySelector(".lightbox");
const defaultData = {
  about: "I’m Kalyan, a photographer based in Halifax, Nova Scotia. I create relaxed, thoughtful photographs of people, gatherings, and the details that make a business feel like itself.",
  contact: { location: "Halifax, NS", phone: "2192387743", instagram: "@yourhandle" },
  shoots: {}
};
const siteData = window.SITE_DATA || defaultData;
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));
const getCategory = slug => categories.find(category => category.slug === slug);
const getRoute = () => location.hash.startsWith("#/")
  ? location.hash.slice(2).split("/").filter(Boolean).map(decodeURIComponent)
  : [];

function setPageTitle(title) {
  document.title = `${title} — Photos by Kalyan`;
}

function renderHome() {
  setPageTitle("Halifax Photographer");
  const categoryCards = categories.map(category => `
    <a class="work-card" href="#/${category.slug}">
      <p class="eyebrow">Halifax photography</p>
      <div><h3>${escapeHtml(category.title)}</h3><p>${escapeHtml(category.description)}</p></div>
      <span class="work-card-link">Explore gallery <span aria-hidden="true">↗</span></span>
    </a>`).join("");

  main.innerHTML = `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Photographer · Halifax, Nova Scotia</p>
        <h1 class="display">People, events, brands &amp; products.</h1>
        <p class="hero-description">Portraits, events, families, brands, and products — photographed with care and a light touch.</p>
        <div class="hero-actions">
          <a class="button-primary" href="#work">Explore the work <span aria-hidden="true">↓</span></a>
          <a class="text-link" href="#/contact">Get in touch <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <figure class="hero-photo">
        <img src="kalyan_reel_cover.png" alt="Kalyan, photographer in Halifax" fetchpriority="high">
      </figure>
    </section>
    <section class="page-shell portfolio-section" id="work" aria-labelledby="work-heading">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Browse by category</p>
          <h2 id="work-heading">Explore the work</h2>
        </div>
        <p>Choose a category to see individual shoots and photo galleries.</p>
      </div>
      <div class="category-grid">${categoryCards}</div>
    </section>`;

  if (location.hash === "#work") {
    requestAnimationFrame(() => document.querySelector("#work")?.scrollIntoView());
  }
}

function renderCategory(slug) {
  const category = getCategory(slug);
  if (!category) return renderNotFound();
  setPageTitle(category.title);
  const shoots = siteData.shoots?.[slug] || [];
  const cards = shoots.map(shoot => {
    const cover = shoot.images?.[0];
    const destination = `#/${slug}/${encodeURIComponent(shoot.slug)}`;
    return `
      <a class="shoot-card" href="${destination}">
        <div class="shoot-cover">${cover ? `<img src="${escapeHtml(cover.src)}" alt="${escapeHtml(cover.alt)}" loading="lazy">` : `<span class="shoot-cover-empty" aria-hidden="true"></span>`}</div>
        <div class="shoot-card-info">
          <div><h2>${escapeHtml(shoot.title)}</h2><p>${escapeHtml(shoot.location)}${shoot.location && shoot.date ? " · " : ""}${escapeHtml(shoot.date)}</p></div>
          <span class="shoot-count">${shoot.images?.length || 0} photos</span>
        </div>
      </a>`;
  }).join("");
  const content = shoots.length
    ? `<div class="shoot-grid">${cards}</div>`
    : `<div class="empty-state"><p class="eyebrow">No galleries yet</p><h2>New stories will appear here.</h2><p>Each shoot has its own gallery. Get in touch if you’d like to plan a session.</p><a class="text-link" href="#/contact">Ask about a session <span aria-hidden="true">↗</span></a></div>`;

  main.innerHTML = `
    <section class="page-shell interior-page">
      <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><span>${escapeHtml(category.title)}</span></nav>
      <header class="page-heading">
        <p class="eyebrow">Photography in Halifax</p>
        <h1 class="page-title">${escapeHtml(category.title)}</h1>
        <p class="intro">${escapeHtml(category.pageDescription)}</p>
      </header>
      <div class="section-heading collection-heading">
        <h2>Galleries</h2>
        ${shoots.length ? `<p>${shoots.length} ${shoots.length === 1 ? "shoot" : "shoots"}</p>` : ""}
      </div>
      ${content}
    </section>`;
}

function renderShoot(categorySlug, shootSlug) {
  const category = getCategory(categorySlug);
  const shoot = (siteData.shoots?.[categorySlug] || []).find(item => item.slug === shootSlug);
  if (!category || !shoot) return renderNotFound();
  setPageTitle(shoot.title);
  const images = shoot.images || [];
  const gallery = images.length
    ? `<div class="gallery">${images.map((image, index) => `
        <button class="gallery-item" type="button" data-index="${index}" aria-label="View photo ${index + 1}: ${escapeHtml(image.alt)}">
          <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" loading="lazy">
          ${image.caption ? `<span class="gallery-caption">${escapeHtml(image.caption)}</span>` : ""}
        </button>`).join("")}</div>`
    : `<div class="empty-state"><p class="eyebrow">Gallery in progress</p><h2>Photos will appear here.</h2><p>This shoot is ready for its images.</p></div>`;

  main.innerHTML = `
    <section class="page-shell interior-page">
      <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><a href="#/${categorySlug}">${escapeHtml(category.title)}</a><span aria-hidden="true">/</span><span>${escapeHtml(shoot.title)}</span></nav>
      <header class="page-heading shoot-heading">
        <p class="eyebrow">${escapeHtml(category.title)}</p>
        <h1 class="page-title">${escapeHtml(shoot.title)}</h1>
        <div class="shoot-meta">${shoot.location ? `<span>${escapeHtml(shoot.location)}</span>` : ""}${shoot.date ? `<span>${escapeHtml(shoot.date)}</span>` : ""}</div>
        ${shoot.description ? `<p class="intro">${escapeHtml(shoot.description)}</p>` : ""}
      </header>
      ${gallery}
    </section>`;

  main.querySelectorAll(".gallery-item").forEach(button => {
    button.addEventListener("click", () => openLightbox(images, Number(button.dataset.index), button));
  });
}

function renderAbout() {
  setPageTitle("About");
  const paragraphs = String(siteData.about || defaultData.about)
    .split(/\n\s*\n/)
    .map(paragraph => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
  main.innerHTML = `
    <section class="page-shell interior-page about-layout">
      <img class="about-photo" src="kalyan_reel_cover.png" alt="Kalyan, photographer in Halifax">
      <div class="about-copy"><p class="eyebrow">About the photographer</p><h1 class="page-title">Hello, I’m Kalyan.</h1>${paragraphs}<a class="button-primary" href="#/contact">Get in touch <span aria-hidden="true">↗</span></a></div>
    </section>`;
}

function renderContact() {
  setPageTitle("Contact");
  const contact = siteData.contact || defaultData.contact;
  const digits = String(contact.phone || "").replace(/\D/g, "");
  const dialNumber = digits.startsWith("1") ? digits : `1${digits}`;
  const phone = digits.length === 10
    ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    : contact.phone || "Add your number in contact.txt";
  const instagram = String(contact.instagram || "@yourhandle").replace(/^@/, "");
  main.innerHTML = `
    <section class="page-shell interior-page contact-page">
      <header class="page-heading"><p class="eyebrow">Halifax, Nova Scotia</p><h1 class="page-title">Get in touch.</h1><p class="intro">For portraits, events, family sessions, and brand photography, reach out directly.</p></header>
      <div class="contact-layout">
        <div class="contact-note"><p class="eyebrow">Let’s make something memorable</p><h2>Tell me what you’re planning.</h2><p>I’d love to hear about the people, moments, or products you’d like photographed.</p></div>
        <div class="contact-list" aria-label="Contact details">
          <div class="contact-row"><span class="contact-label">Location</span><span class="contact-value">${escapeHtml(contact.location || "Halifax, NS")}</span></div>
          <a class="contact-row" href="tel:+${escapeHtml(dialNumber)}"><span class="contact-label">Mobile</span><span class="contact-value">${escapeHtml(phone)}</span><span class="contact-arrow" aria-hidden="true">↗</span></a>
          <a class="contact-row" href="https://wa.me/${escapeHtml(dialNumber)}" target="_blank" rel="noreferrer"><span class="contact-label">WhatsApp</span><span class="contact-value">Message me</span><span class="contact-arrow" aria-hidden="true">↗</span></a>
          <a class="contact-row" href="https://instagram.com/${escapeHtml(instagram)}" target="_blank" rel="noreferrer"><span class="contact-label">Instagram</span><span class="contact-value">@${escapeHtml(instagram)}</span><span class="contact-arrow" aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>`;
}

function renderNotFound() {
  setPageTitle("Page not found");
  main.innerHTML = `<section class="page-shell interior-page empty-state"><p class="eyebrow">Page not found</p><h1 class="page-title">This page isn’t here.</h1><a class="button-primary" href="#/">Back to home <span aria-hidden="true">↗</span></a></section>`;
}

function setCurrentNavigation(route) {
  const activeSlug = route[0] || "";
  nav.querySelectorAll("a").forEach(link => {
    if (activeSlug && link.getAttribute("href") === `#/${activeSlug}`) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function closeMenu() {
  nav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "Menu";
}

function render() {
  const route = getRoute();
  if (!route.length) renderHome();
  else if (route[0] === "about" && route.length === 1) renderAbout();
  else if (route[0] === "contact" && route.length === 1) renderContact();
  else if (route.length === 1) renderCategory(route[0]);
  else if (route.length === 2) renderShoot(route[0], route[1]);
  else renderNotFound();
  setCurrentNavigation(route);
  closeMenu();
  if (location.hash !== "#work") window.scrollTo({ top: 0, behavior: "instant" });
}

let lightboxImages = [];
let lightboxIndex = 0;
let lightboxTrigger = null;

function updateLightbox() {
  const image = lightboxImages[lightboxIndex];
  lightbox.querySelector("img").src = image.src;
  lightbox.querySelector("img").alt = image.alt || "Photograph";
  lightbox.querySelector("figcaption").textContent = image.caption || "";
  lightbox.querySelector(".lightbox-prev").hidden = lightboxImages.length < 2;
  lightbox.querySelector(".lightbox-next").hidden = lightboxImages.length < 2;
}

function openLightbox(images, index, trigger) {
  lightboxImages = images;
  lightboxIndex = index;
  lightboxTrigger = trigger;
  updateLightbox();
  lightbox.showModal();
  lightbox.querySelector(".lightbox-close").focus();
}

function moveLightbox(direction) {
  lightboxIndex = (lightboxIndex + direction + lightboxImages.length) % lightboxImages.length;
  updateLightbox();
}

lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
lightbox.querySelector(".lightbox-prev").addEventListener("click", () => moveLightbox(-1));
lightbox.querySelector(".lightbox-next").addEventListener("click", () => moveLightbox(1));
lightbox.addEventListener("click", event => { if (event.target === lightbox) lightbox.close(); });
lightbox.addEventListener("close", () => lightboxTrigger?.focus());
document.addEventListener("keydown", event => {
  if (!lightbox.open) return;
  if (event.key === "ArrowLeft" && lightboxImages.length > 1) moveLightbox(-1);
  if (event.key === "ArrowRight" && lightboxImages.length > 1) moveLightbox(1);
});

menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.textContent = open ? "Close" : "Menu";
});

window.addEventListener("hashchange", () => {
  if (location.hash === "#work") {
    document.querySelector("#work")?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    return;
  }
  render();
});

render();
