require('dotenv').config();

const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');

const opentok = require('./opentok');

const listenIp = '0.0.0.0';
const listenPort = process.env.PORT || 8080;

const playerOffset1 = parseInt(process.env.PLAYER_OFFSET_PRIMARY || '0', 10);
const playerOffset2 = parseInt(process.env.PLAYER_OFFSET_SECONDARY || '0', 10);

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', express.static('public'));

// Get API Key
app.get('/apiKey', async (req, res, next) => {
  try {
    const apiKey = await opentok.getApiKey();
    res.json({ apiKey });
  } catch (error) {
    next(error);
  }
});

// Get Session ID
app.get('/sessionIds', async (req, res, next) => {
  try {
    const { name: sessionName } = req.query;
    const sessionIds = await opentok.getSessionIds();
    res.json(sessionIds);
  } catch (error) {
    next(error);
  }
});

// Get Token
app.get('/tokens', async (req, res, next) => {
  try {
    const tokens = await opentok.getTokens();
    res.json(tokens);
  } catch (error) {
    next(error);
  }
});

// Get Archives
app.get('/archives', async (req, res, next) => {
  try {
    const { name: sessionName } = req.query;
    const archives = await opentok.getArchives(sessionName);
    res.json(archives);
  } catch (error) {
    next(error);
  }
});

// Get Archive Offsets
app.get('/archives/offset', async (req, res, next) => {
  try {
    console.log(`Offset: ${playerOffset1}s, ${playerOffset2}s`);
    res.json({
      primary: playerOffset1,
      secondary: playerOffset2,
    });
  } catch (error) {
    next(error);
  }
});

// Start Archive
app.post('/archives', async (req, res, next) => {
  try {
    const { sessionName } = req.body;
    const archive = await opentok.startArchive(sessionName);
    console.log(`Started Archive: ${archive.id}`);
    res.json(archive);
  } catch (error) {
    next(error);
  }
});

// Stop Archive
app.post('/archives/:archiveId/stop', async (req, res, next) => {
  try {
    const { archiveId } = req.params;
    const archive = await opentok.stopArchive(archiveId);
    console.log(`Stopped Archive: ${archive.id}`);
    res.json(archive);
  } catch (error) {
    next(error);
  }
});

// Restart Archive
app.post('/archives/:archiveId/restart', async (req, res, next) => {
  try {
    const { archiveId } = req.params;
    const { sessionName } = req.body;
    const archive = await opentok.restartArchive(archiveId, sessionName);
    console.log(`Restarted Archive: ${archiveId} - ${archive.id}`);
    res.json(archive);
  } catch (error) {
    next(error);
  }
});

const httpServer = http.createServer(app);
httpServer.listen(listenPort, listenIp, () => console.log(`Server listening on ${listenIp}:${listenPort}`));
