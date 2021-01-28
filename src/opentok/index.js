const OpenTok = require('opentok');

const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;

const sessionId1 = process.env.SESSION_ID_PRIMARY;
const sessionId2 = process.env.SESSION_ID_SECONDARY;

const sessionJoinDelay = parseInt(process.env.SESSION_JOIN_DELAY || '5', 10);
const sessionStopDelay1 = parseInt(process.env.SESSION_STOP_DELAY_PRIMARY || '10', 10);
const sessionStopDelay2 = parseInt(process.env.SESSION_STOP_DELAY_SECONDARY || '10', 10);

const client = new OpenTok(apiKey, apiSecret);

const getSessionToken = async (sessionId) => {
  try {
    const options = {
      role: 'publisher',
      expireTime: (new Date().getTime() / 1000) + 86400, // 1 day
    };
    const token = client.generateToken(sessionId, options);
    return Promise.resolve(token);
  } catch (error) {
    return Promise.reject(error);
  }
};

const startSessionArchive = async (sessionId, sessionName) => new Promise((resolve, reject) => {
  const options = {
    name: sessionName,
    hasVideo: true,
    hasAudio: true,
    outputMode: 'composed',
    layout: { type: 'bestFit' },
    resolution: '1280x720'
  };
  console.log(`Start Archiving Session ${sessionId}`);
  client.startArchive(sessionId, options, (error, archive) => {
    if (error) {
      reject(error);
    } else {
      resolve(archive);
    }
  });
});

const stopSessionArchive = async (archiveId) => new Promise((resolve, reject) => {
  console.log(`Stop Archiving ${archiveId}`);
  client.stopArchive(archiveId, (error, archive) => {
    if (error) {
      reject(error);
    } else {
      resolve(archive);
    }
  });
});

const listSessionArchive = async (sessionId, sessionName) => new Promise((resolve, reject) => {
  const options = { sessionId };
  client.listArchives(options, (error, archives, totalCount) => {
    if (error) {
      reject(error);
    } else {
      console.log(`Total Count: ${totalCount}`);
      if (sessionName != null && sessionName !== '') {
        const filteredArchives = archives.filter(archive => archive.name === sessionName);
        console.log(`Filtered Count: ${filteredArchives.length}`);
        resolve(filteredArchives);
      } else {
        console.log('No Filter');
        resolve(archives);
      }
    }
  });
});

const sendSignal = async (type, data) => new Promise((resolve, reject) => {
  const signalBody = { type, data };
  client.signal(sessionId1, null, signalBody, (error) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
});

const getApiKey = async () => {
  try {
    return Promise.resolve(apiKey);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getSessionIds = async () => {
  try {
    return Promise.resolve({
      primary: sessionId1,
      secondary: sessionId2,
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTokens = async () => {
  try {
    const session1Token = await getSessionToken(sessionId1);
    const session2Token = await getSessionToken(sessionId2);
    return Promise.resolve({
      primary: session1Token,
      secondary: session2Token,
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

const startArchive = async (sessionName) => {
  try {
    const archive = await startSessionArchive(sessionId1, sessionName);
    return Promise.resolve(archive);
  } catch (error) {
    return Promise.reject(error);
  }
};

const stopArchive = async (archiveId) => {
  try {
    const archive = await stopSessionArchive(archiveId);
    return Promise.resolve(archive);
  } catch (error) {
    return Promise.reject(error);
  }
};

const restartArchive = async (archiveId, sessionName) => {
  try {
    // Signal to Join Session 2
    console.log('join sending');
    await sendSignal('join', { sessionType: 'secondary', sessionId: sessionId2 });
    console.log('join sent');

    // Delay (Join)
    console.log('join delaying');
    await wait(sessionJoinDelay);
    console.log('join delayed');

    // Start Archive Session 2
    console.log('2 starting');
    const archive2 = await startSessionArchive(sessionId2, sessionName);
    console.log('2 started');

    // Delay (Stop Session 1)
    console.log('1 delaying');
    await wait(sessionStopDelay1);
    console.log('1 delayed');

    // Stop Archive Session 1
    console.log('1 stopping');
    await stopSessionArchive(archiveId);
    console.log('1 stopped');

    // Start Archive Session 1
    console.log('1 starting');
    const archive1 = await startSessionArchive(sessionId1, sessionName);
    console.log('1 started');

    // Delay (Stop Session 2)
    console.log('2 delaying');
    await wait(sessionStopDelay2);
    console.log('2 delayed');

    // Stop Archive Session 2
    console.log('2 stopping');
    await stopSessionArchive(archive2.id);
    console.log('2 stopped');

    // Signal to Leave Session 2
    console.log('leave sending');
    await sendSignal('leave', { sessionType: 'secondary', sessionId: sessionId2 });
    console.log('leave sent');

    return Promise.resolve(archive1);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getArchives = async (sessionName) => {
  try {
    const session1Archives = await listSessionArchive(sessionId1, sessionName);
    const session2Archives = await listSessionArchive(sessionId2, sessionName);

    const archives = [...session1Archives, ...session2Archives];
    archives.sort((a, b) => a.createdAt - b.createdAt);

    return Promise.resolve(archives);
  } catch (error) {
    return Promise.reject(error);
  }
};

const wait = delay => new Promise((resolve) => setTimeout(resolve, delay * 1000));

module.exports = {
  getApiKey,
  getSessionIds,
  getTokens,

  startArchive,
  stopArchive,
  restartArchive,
  getArchives,
};
