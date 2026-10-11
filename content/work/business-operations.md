## The brief

Traditional businesses run on paper, spreadsheets and memory. Sales, stock and purchases are
tracked by hand, the few tools they use do not talk to each other, owners cannot see what is
happening today, and managers and workers coordinate by word of mouth. Off-the-shelf software
is too rigid for the way each business actually works.

The product: one platform that takes a business off paper without forcing it into someone else's
process. I was its CTO and founding engineer.

## What I built

A platform made of modules, for sales, purchasing, inventory and analytics, that each business
switches on as it needs them. Underneath is one data model, so what is entered in one place
reaches the rest. On top, every person sees a dashboard for their role, and AI reads incoming
email enquiries and drafts the replies.

## The decisions that mattered

### Modules, switched on per business

Each business gets only the modules it needs, configured for it without code changes. New
modules, including ones built for a single business's own process, join without disturbing what
is already running.

### One data model underneath

All modules share one PostgreSQL data model, with every business kept apart from the others. A
sale, a purchase and a stock count land in the same place, so reports across the whole business
come from one source instead of being stitched together from separate tools.

### Software that follows the real day

Workflows were modelled on how the businesses actually operate. A daily pricing decision, for
example, is entered once and carried through everything downstream. Important transactions pass
through an approval step, which leaves an audit trail and catches errors before they cost money.

### Built for the people on the floor

Owners, managers and workers each see what matters to them. The interface was designed for
people who do not think of themselves as computer users, and it works in more than one language,
because whether a system is used is decided by the people doing the work.

### AI where it earns its place

Email enquiries are read, sorted and routed, and a draft reply waits for each one, so leads stop
slipping through. Forecasts and customer segments show owners where their returns come from. The
AI is there because it saves missed revenue, not to decorate the product.

## My part

As CTO I made the technical decisions, designed the architecture from the first sketch to
production, and set the product roadmap with the business side, turning operational problems
into specifications and milestones. I led and mentored the development team and wrote about 60%
of the code myself, including the multi-tenant data design, the email pipeline, and the
forecasting and reporting.

## The outcome

Four businesses onboarded, with teams of 2 to 12 people. For each of them, the day's operations
moved off paper, spreadsheets and separate tools into one system that everyone from the owner to
the floor can see.
