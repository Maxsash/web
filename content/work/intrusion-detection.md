## The brief

Fibre-optic sensing hardware produces a constant, high-frequency stream of readings. The client
had the hardware; it needed the software that turns those readings into security alerts people
act on, for critical infrastructure. It was a new project, with nothing to build on.

## What I built

Two servers with different jobs. A local Raspberry Pi server runs the detection work and keeps
private site data on the LAN. An admin server receives only the information needed to notify site
owners and managers on WhatsApp, Telegram, email and ntfy.

The monitoring screen puts each event on a live map beside the relevant camera. A separate video
service converts the RTSP feeds into something the browser can show, lets an operator switch
between cameras or choose one for the monitor, and can take webcam inputs too.

## The decisions that mattered

### Compute on site; notify from one place

The local Raspberry Pi server does the detection work beside the sensors. Sensor and other
private operational data stay on the site's LAN. The admin server has a narrower job: it receives
enough alert information to notify the right owner or manager through the channel they use.

### Keep two kinds of data useful

Sensor readings arrive continuously and are stored in InfluxDB, a database made for time series.
Events, users and alerts are records that people look up and audit, so they live in PostgreSQL.

### Turn RTSP into a usable monitoring view

The CCTV hardware exposed RTSP feeds, which browsers do not play directly. Converting a feed for
the web introduces delay, so I built a dedicated service around that boundary rather than mixing
video conversion into alert processing. Operators can switch among cameras, select the camera
shown in the monitor and use webcam inputs when needed.

### Put context beside every alarm

An alert on its own says that something happened. The monitoring screen shows where, on a live
map, with the site's CCTV stream playing beside it, so whoever is watching can judge it at once.

### Treat the network as part of access control

The Raspberry Pi deployment operates only on defined networks. Sign-in, role-based access and
careful handling of credentials were part of the first version, not added later.

## My part

I was the founding engineer and led the work: the architecture and technology choices, a team of
backend and frontend developers, and the link between the hardware engineers and the software. I
worked across the backend, infrastructure and deployment, then deployed and configured the system
on site and trained the people who use it.

## The outcome

The system has been deployed at five sites over a year and a half. It is private, so there are
no screenshots; the drawing above shows how it fits together.
