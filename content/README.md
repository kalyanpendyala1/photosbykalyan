# Add photographs

Categories are the folders `events`, `branding`, `couples-family`, `studio-portraits`, and `products`.

To add a shoot, create a folder inside the right category, add a `shoot.txt` file, and put the photos in that folder (or in folders inside it):

```text
title=Your shoot title
location=Halifax, NS
date=October 2026
description=One or two sentences about this shoot.
```

JPG, JPEG, and PNG photos appear in the gallery while keeping their original proportions. Common camera RAW files are converted to JPEG when GitHub publishes the site; the original files remain in the repository.

Edit `about.txt` to change the About page and `contact.txt` to change the contact details. Commit your changes to the `main` branch to trigger the GitHub Pages build. The first time, select **GitHub Actions** under **Settings → Pages**.
