## The brief

Traditional businesses run on paper, spreadsheets and memory. Sales, stock and purchases are
tracked by hand, the few tools they use do not talk to each other, owners cannot see what is
happening today, and managers and workers coordinate by word of mouth. Off-the-shelf software
is too rigid for the way each business actually works.

The product: one platform that takes a business off paper without forcing it into someone else's
process. Clients choose and pay for the modules they need. I was its CTO and founding engineer.

## What I built

A platform made of purchasable modules for sales, purchasing, inventory and enquiries. Each
business switches on only what it needs. The active modules share one PostgreSQL data model while
keeping businesses separate. Practical insights adapt to the modules and data a business actually
has, instead of treating analytics as an add-on after data entry. Every person sees a dashboard for
their role, and AI reads incoming email enquiries and drafts replies for review.

## The decisions that mattered

### Modules, switched on per business

Each business chooses — and pays for — only the modules it needs, configured without code changes.
New modules, including ones built for a single business's own process, join without disturbing what
is already running. That choice runs deeper than showing or hiding screens: a missing module also
means missing data and related pieces elsewhere in the product. The platform still has to make
sense as a useful partial system when a business has no purchasing, inventory or sales module.

### Insights first, not an afterthought

Many operations products stop at recording what happened and sell analytics separately. We began
with the questions an owner or manager would need answered, then designed the reports and
dashboards around decisions they could actually make. The same approach later informed the
insights in Household Hub.

### One private data model underneath

All modules share one PostgreSQL data model, with every business kept apart from the others. A
sale, a purchase and a stock count land in the same place, so reports across the whole business
come from one source instead of being stitched together from separate tools. The insights adapt
to the selected modules and available data, without implying certainty from data a business does
not collect.

### Software that follows the real day

Workflows were modelled on how the businesses actually operate. A daily pricing decision, for
example, is entered once and carried through everything downstream. Important transactions pass
through an approval step, which leaves an audit trail and catches errors before they cost money.

### Built for the people doing the work

Owners, managers and workers each see what matters to them. The interface was designed for
people who do not think of themselves as computer users, including people with limited literacy.
Iconography, colour and bilingual or multilingual options carry meaning alongside text. We went
through many iterations to make each workflow intuitive for the purpose it serves, because whether
a system is used is decided by the people doing the work.

### AI where it earns its place

Email enquiries are read, sorted and routed, and a draft reply waits for each one, so the team can
review them in one place. Forecasts and customer segments show owners where their returns come
from. The AI keeps incoming enquiries visible and gives the team a reply to review.

## My part

As CTO I made the technical decisions, designed the architecture from the first sketch to
production, and set the product roadmap with the business side, turning operational problems
into specifications and milestones. I led and mentored the development team. My own work included
the module architecture, multi-tenant data design, email pipeline, and reporting and insights.

## The outcome

Four businesses onboarded, with teams of 2 to 12 people. For each of them, the day's operations
moved off paper, spreadsheets and separate tools into one system that everyone from the owner to
the floor can see.
