# Baimuru Primary School Website

A free, static public information website for Baimuru Primary School —
no paid hosting, no paid domain.

## What's in this folder

```
index.html          Home page
about.html           About the school
news.html            News & announcements
newsletter.html      Quarterly newsletter archive
finance.html         Financial reports
policies.html        School policies, by category
downloads.html       Forms & downloads
contact.html         Contact page

css/style.css         All styling
js/script.js          Mobile menu + active-page highlight

documents/
  newsletters/        Put newsletter PDFs here
  finance/            Put financial report PDFs here
  policies/           Put policy PDFs here
  forms/              Put form PDFs here
```

## Publishing for free with GitHub Pages

You already created the repository **baimurupprimary.github.io** on
GitHub. Next steps:

1. On the repository page, click **Add file → Upload files**.
2. Drag in every file and folder from this project, keeping the same
   folder structure (`css/`, `js/`, `documents/…`).
3. Scroll down and click **Commit changes**.
4. Go to **Settings → Pages** (left sidebar).
5. Under **Build and deployment → Source**, choose **Deploy from a
   branch**, branch **main**, folder **/ (root)**, then **Save**.
6. GitHub will give you a live web address, usually:
   `https://baimurupprimary.github.io`
   (It can take 1–2 minutes to go live the first time.)

That's it — the whole site is hosted free, with free HTTPS, and no
domain purchase required.

## Adding a new newsletter, report, policy or form (no coding needed)

1. Save the new PDF with a clear name, e.g. `2026-q2.pdf`.
2. In GitHub, open the matching folder — e.g. `documents/newsletters/`.
3. Click **Add file → Upload files**, upload the PDF, then **Commit
   changes**.
4. Open the matching page file (e.g. `newsletter.html`) in GitHub,
   click the pencil (✏️) **Edit** icon.
5. Copy one existing `<li class="doc-item">…</li>` block, paste it
   as a new line, and change the title and the file name in the
   `href="documents/…"` part to match your new PDF.
6. Click **Commit changes**. The page updates automatically — no
   need to touch any other file.

The same copy-paste-and-rename approach works for `finance.html`,
`policies.html` (inside a `<div class="policy-card">`), and
`downloads.html`.

## Before you publish — replace the placeholders

Search each page for text in `[square brackets]` — school history,
vision/mission, staff names, phone/email, and the contact form's
`mailto:school@example.com` address — and replace with real school
information. Sample "coming soon" newsletter/report links can be
deleted once real PDFs are uploaded.

## Optional next steps

- Add a real school logo image in `images/` and swap it in for the
  "BPS" circle in each page's `<div class="school-crest">`.
- Once the school has funding, a purchased domain (e.g.
  `.com.pg`) can be connected to this same site later — the pages
  do not need to be rebuilt.
