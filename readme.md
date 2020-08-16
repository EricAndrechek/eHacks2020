# Disaster Help Index

![Disaster Help Index Logo](https://raw.githubusercontent.com/EricAndrechek/eHacks2020/master/logos/dhi-both-removebg-short.png)
## The one-stop website to see world disasters and events and learn how you can best help

### Inspiration
As 2020 started off with wildfires in Australia, and February moved to a terrible locust outbreak in Africa, followed by millions placed into quarantine in Italy due to the Covid-19 outbreak, 2020 has been rough. 

![2020 Calendar Meme](https://raw.githubusercontent.com/EricAndrechek/eHacks2020/master/logos/leaked-rest-of-2020-calendar-meme.jpg)

We decided that there were so many events going on in 2020, it was hard to keep track of what was happening where, and knowing how you could help. That's why we made Disaster Help Index or DHI.

In addition to struggling to keep track of disasters in the world, many are not getting the support they need. Rather than sending what you think may help people in disaster areas, they are able to submit their own requests that you can fulfill. 
### What it does
DHI displays a map of the world, showing you a large collection of all the current disasters with a legend to categorize which one each falls under. You can also click on a disaster to get more information about it, including some stats and a description.

![Map Demo](https://raw.githubusercontent.com/EricAndrechek/eHacks2020/master/logos/map-demo-sat.png)

In addition to displaying stats and a description for each disaster, DHI shows you various categories and items that locals in the error have requested that you can do to help. Some of these may be items you could pay for for them or something simple like writing to your congressional representative to help enact support from the government. 

Our website also has functionality built in to allow people to self-report disasters and add requests to a disaster. All of these features also use your IP address to verify you live in the disaster area. This protects our database from being flooded with false data and allows only locals and those directly affected to submit a request for help.
### How we built it
We chose to separate our project into a frontend and backend, both hosted separately. The backend acts as an API that our frontend can query. 

![Server Architecture](https://raw.githubusercontent.com/EricAndrechek/eHacks2020/master/logos/server-setup.png)

The frontend is a React app running on Vercel ([e-hacks2020.vercel.app](https://e-hacks2020.vercel.app)). It uses the Google Maps API to automatically turn the location into geolocation coordinates that can be displayed on the map.

The backend is a Python Flask app running on a Ubuntu server configured with an Nginx proxy. It uses Firebase Realtime Database to store the disasters and requests. It uses [ipapi.co](https://ipapi.co) to find and verify IP addresses. 
### Challenges we ran into
On the backend said, Nginx was passing all IP addresses to the Flask server as localhost, which makes sense as it is a proxy. This was solved by adding headers to the proxy_pass and forwarding them to the Flask app.

![Nginx Config](https://raw.githubusercontent.com/EricAndrechek/eHacks2020/master/logos/nginx.png)
On the frontend side, we had quite a few issues in both rendering maps properly as well as sending all the data to the backend. Both of these issues were fixed with teamwork, perseverance, and a lot of reading through error logs.
### Accomplishments that we're proud of
We are incredibly happy to have our entire project finished and fully functional with a demo anyone could use. 

Most impressively of all, two of our four teammates were complete beginners to programming, so getting them up and running learning how to use GitHub, VSCode, and Python/React was a struggle. In the end, they were able to contribute to our project heavily and made incredible progress!
### What we learned
Two people on our team were completely new to programming so they learned a lot about Python and React and all the systems tying our code together. 
### What's next for Disaster Help Index
We hope to grow our platform to the point where real people are using it. We don't need to change any code because we have it developed in an easily scalable way. This ensures that our project could take off overnight without requiring any intervention from us.