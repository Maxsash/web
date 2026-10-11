## The brief

Velora Rights is the practice of an Indian intellectual property advocate who writes about
trademarks, copyright and the rights of creators. When we started, it had no presence beyond an
Instagram account.

The owner ranked what mattered, in order: be found, by search engines and by the AI assistants
that increasingly decide who gets found; be easy to edit without a developer; then look good.
One rule shaped everything else. The Bar Council of India does not allow advocates to advertise,
so the site could inform but never promote. Search had to do the work an advert does anywhere
else.

## What I built

A site of practice-area guides, a blog, an about page and a careers page for internships. Every
page is generated in advance with its full text in the HTML, so search engines and assistants
read exactly what a visitor reads. Every page also has its own share card, so a link posted on
social media looks intended.

## The decisions that mattered

### Found first, and checked

Every page carries structured data that tells search engines what it is: the legal service, its
founder, each article, its breadcrumbs, its questions and answers. A check in the build fails if
any page stops being generated in advance. At launch I verified the site with Google Search
Console and Bing Webmaster Tools, submitted the sitemaps and requested indexing for the key
pages.

### Written for AI assistants too

The site publishes an `llms.txt` index and an RSS feed, both generated from its own content, and
it lets AI crawlers in on purpose, so an assistant can read an article and cite it.

### The owner publishes without me

Each article and practice area is a Markdown file with a few simple fields at the top, started
from a template and explained in a plain-language guide written for the owner. The file's name
is the page's address, so the two can never drift apart. Every file is checked before each
deploy: a mistake stops the deploy instead of publishing a broken page. The content is kept in a
portable format, so a visual editor can be added later without moving a single article.

### The rule as a design constraint

The copy informs and never sells: no "hire me", no testimonials, no superlatives. A disclaimer
appears on the first visit. This was not tidied up at the end; it decided the words and the
flows from the start.

### Nothing thin, nothing extra

Thin pages hurt a site's ranking, so only the four practice areas with real substance went live,
and the rest wait until they have something to say. There is no database and no content
management system, because nothing needed one yet.

## The outcome

In a single month, search alone brought five internship applications and an enquiry that became
a client. There were no ads and no outreach.

For a practice that may not advertise, that is the point of the site: it is how people find the
practice. It was tested against a real production build before launch, and it came with three
guides: publishing for the owner, setup, and the design decisions for the next developer.
