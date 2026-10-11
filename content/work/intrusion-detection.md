## The brief

Fibre-optic sensing hardware produces a constant, high-frequency stream of readings. The client
had the hardware; it needed the software that turns those readings into security alerts people
act on, for critical infrastructure. It was a new project, with nothing to build on.

## What I built

Small computers on site watch the sensor data and catch anomalies where they happen. A backend
on AWS records every reading and event, alerts the right people on WhatsApp, Telegram, email and
ntfy, and drives a monitoring screen: each event at its exact place on a live map, with the CCTV
feed beside it.

## The decisions that mattered

### Detect on site, coordinate in the cloud

Anomaly detection runs on Raspberry Pi nodes at each site, close to the sensors, so it reacts
quickly. Storage, alerts and the dashboard run on AWS, where they grow with the number of sites.

### Two kinds of data, two databases

Sensor readings arrive continuously and are stored in InfluxDB, a database made for time series.
Events, users and alerts are records that people look up and audit, so they live in PostgreSQL.

### Alerts that reach people, without burying them

Alerts go out on several channels at once, with throttling and escalation built in, so the right
people hear about an event without being flooded with messages.

### Context with every alarm

An alert on its own says that something happened. The monitoring screen shows where, on a live
map, with the site's CCTV stream playing beside it, so whoever is watching can judge it at once.

### Secure for sensitive sites

Sign-in, role-based access, deployments restricted by network address and careful handling of
credentials were part of the first version, not added later.

## My part

I was the founding engineer and led the work: the architecture and technology choices, a team of
backend and frontend developers, and the link between the hardware engineers and the software. I
wrote about 60% of the code, across the backend, infrastructure and deployment, then deployed and
configured the system on site and trained the people who use it.

## The outcome

The system has been deployed at five sites over a year and a half. It is private, so there are
no screenshots; the drawing above shows how it fits together.
