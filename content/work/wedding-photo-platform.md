## The brief

A photographer delivered about 7,500 photographs from a family wedding: 196 GB of raw files.
Nobody can browse that, and no guest could find the pictures they are in. The family wanted
something guests would enjoy, and there was no budget for hosting or for paid image services.

## What I built

A site that tells the day in chapters, with eight full-screen photo reels, an album for each
event, a gallery of every photograph worth keeping, and a People page where each person has a
page of every photograph they appear in.

The real site is private to the family. The public demo runs the same code with a placeholder
couple and 1,004 of the photographs in eight albums, every face frosted.

## The decisions that mattered

### Do the expensive work once, offline

Hosted face recognition bills per image, which at this volume was out of the question. So
everything heavy happens on a laptop before anything is published: removing duplicates, resizing,
finding faces and grouping them by person. Face recognition and image processing stay out of
the request path, with no per-image recognition bill.

### Keep the best frame of every burst

Roughly a third of the photographs were near-duplicates from burst shooting. Each photograph is
fingerprinted by how it looks, near-identical frames are grouped, and the sharpest one stays.
7,504 photographs became 5,036.

### Find people, then let a person fix the mistakes

The pipeline found 17,731 faces and grouped them into 92 people. Face grouping is never perfect,
so a small curation tool, which only ever runs on my machine, lets me correct the groups and
assign photographs to the day's events.

### Fast on a phone at the venue

The 196 GB became 1.31 GB of modern image files, stored on Cloudflare R2's free tier. Pages are
built on the server from the photo lists, so images start downloading as the page arrives, and
the app itself depends on nothing but Next.js and React.

### A demo that cannot leak the wedding

Faces in the demo were found by three independent detectors, because each caught faces the
others missed. Photographs with readable text, crowds or a face no detector found were left out
rather than risked, and location data was stripped. The demo build fails if any real name, date
or web address survives in it.

## The outcome

The whole pipeline ran in about two and a half hours on a laptop, and the face recognition took
under six minutes of that. The family has the day as a story to share, guests can find the
photographs they are in, and nothing is paid per image.
