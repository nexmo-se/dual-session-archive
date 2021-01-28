# Dual Session Archiving
POC/Demo application built for Gapless Archiving using Two Sessions

### Setup (Local)
1. clone this repo
2. run `npm install`
3. setup `.env` according to `.env.example`
4. run `npm start`

### Setup (Heroku)
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/nexmo-se/dual-session-archive)

### Using the application
- User Page: `/`
- Admin Page (with controls to start/stop/restart archiving): `/admin.html`
- Video Page (to view archived playlist): `/player.html`

### Demo Workflow

#### 1. Join as Admin
1. On your browser, go to `/admin.html`.
2. You will be automatically connected to the opentok session (session 1) according to the session ID provided when you deploy the application.
3. In this mode, you will have the option to start/stop/restart an archive.

#### 2. Join as Participant
1. On your other browser, or another computer, go to `/index.html`.
2. You will be automatically connected to the opentok session (session 1) according to the session ID provided when you deploy the application.
3. You will not have the option to start/stop/restart the archive because you are not an admin.

#### 3. Start Archiving
1. On the admin page, enter a name for your archive.
2. Click on the `Start Archive` button.
3. The archive is now running, you may start to have a proper video call session.

#### 4. Restart Archiving without Loss
1. After some time (before the end of opentok archiving limit), on the admin page, click on the `Restart Archive` button to kick start the procedure to restart the archive.
2. This will cause all users to start connecting and publishing to session 2 according to the session ID provided when you deploy the application.
3. Archiving will start on session 2, as the interim archive so that you will not lose any video data.
4. Once session 2 archiving has started, archiving of session 1 will be stopped and restarted.
5. Once session 1 archiving has restarted, archiving of session 2 will be stopped and all users will stop publishing to session 2.

#### 5. Stop Archiving
1. At the end of the video session, on the admin page, click on the `Stop Archive` button.
2. All archiving activity will be stopped.

#### 6. Watch the Archive Playbacks
1. Go to `/player.html` on any browser.
2. Enter the archive name provided when the admin first started the archive.
3. Click on the `Get Archive` button.
4. Watch the full archiving playlist (back-to-back autoplay) of the entire session. There should be no missing gap of the video, but some overlapping between session 1 and session 2 archives may happen.

### APIs
#### Get Api Key
#### Get Session IDs
#### Get Tokens
#### Start Archive
#### Stop Archive
#### Restart Archive
#### List Archives
#### Get Archive Offsets

