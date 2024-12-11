# findstay

Scrapes Airbnb and Google maps to show distance each Airbnb is to a supermarket, gym, cafe, etc.

##### Click to watch demo:

[![Watch the video](https://img.youtube.com/vi/Jdpgfa5-Yb0/0.jpg)](https://www.youtube.com/watch?v=Jdpgfa5-Yb0)

## Technology

The backend / frontend is written in Next.js with TypeScript and a PostgreSQL database.
The GIS calculations are done in the database with PostGIS. All of the POI (points of interest) and
Airbnbs are mapped on OpenStreetMap using the OpenLayers library.

## Setup

To create an instance of findstay run the following commands:

```sh
# Creates a PostgreSQL database and node server running the website
docker compose up
```

Then navigate to (localhost:3000)[http://localhost:3000]

## Project Organization

-   `/prisma`: contains database models and migrations
-   `/src/components`: contains all of the components used on the pages of the website
-   `/src/hooks`: reusable React hooks
-   `/src/pages`: each file is an individual page for the website
-   `/src/server`: contains all server side logic, including database, Stripe processing,
    authentication, and API.
-   `/src/utils`: the logic for scraping, caching, geometric calculations, and reusable functions
    lives here
