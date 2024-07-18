const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const cron = require('node-cron');
const moment = require('moment-timezone');

// Custom Requires
const { sequelize } = require('../models');

const config = require('./config/vars');
const logger = require('./config/logger');
const routes = require('./routes');
const response = require('./utility/response');
const rescodes = require('./utility/rescodes');

const generalService = require('./services/general.service');
const {
  getFilteredData,
  getShiftData,
  processCurrentHourData
} = require('./services/generalSocket.service');
const xlsx = require('xlsx');
const { sampleData } = require('../models/index');
const userController = require('./controllers/general.controller');

// app express
const app = express();

// Enable Logger & Performance
app.use(
  logger.httpErrorLogger,
  logger.httpSuccessLogger,
  logger.performanceLogger,
);

// cors Options
const corsOptions = {
  origin: '*',
};
app.use(cors(corsOptions));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

// API V1 Action Routes
app.use('/api/v1', routes);

// home handler
app.use('/', (req, res, next) => {
  res.response = { code: 404, message: rescodes.notFound };
  next();
});

// 404 handler
routes.use((req, res, next) => {
  res.response = { code: 404, data: { message: rescodes.notFound } };
  next();
}, response.default);

// create schema
const createSchema = async function () {
  await sequelize.showAllSchemas({ logging: false }).then(async (data) => {
    if (!data.includes(config.db.schema)) {
      await sequelize.createSchema(config.db.schema);
    }
  });
};
createSchema();

cron.schedule('1 * * * *', async () => {
  const currentTime = new Date().toLocaleTimeString();
  await generalService.hourlyData2();
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  socket.on('message', (data) => {
    const parsedData = JSON.parse(data);

    // Function to process current hour data and emit it
    const emitCurrentHourData = async () => {
      const currentHourData = await processCurrentHourData(parsedData.duration);
      io.emit('getCurrentHour', currentHourData);
    };

    // Schedule the task to run every second
    const task = cron.schedule('*/15 * * * * *', emitCurrentHourData);

    // Start the cron job
    task.start();

    // Stop the cron job when the socket disconnects
    socket.on('disconnect', () => {
      task.stop();
    });
  });
});

// Cron job to emit data every 15 seconds
cron.schedule('*/15 * * * * *', async () => {
  try {
    const {
      shiftActual,
      shiftUph,
      overAllActual,
      overAllUph,
      overTime,
      target,
    } = await getShiftData();

    const data = await getFilteredData();
    const result = {
      shiftActual: data.totalCount + shiftActual,
      totalCount: data.totalCount,
      timeRange: `${data.startHour} - ${data.endHour}`,
      target,
      overTime,
      shiftUph,
      overAllActual: overAllActual + data.totalCount,
      overAllUph,
    };
    io.emit('dataUpdate', result);
  } catch (error) {
    console.error('Error while emitting data:', error);
  }
});

sequelize
  .sync({ logging: false })
  .then(() => {
    logger.info('DB Connection Successful');

    httpServer.listen(config.app.port, () => {
      logger.info(`Listening to port ${config.app.port}`);
    });
  })
  .catch((error) => {
    logger.info('DB Connection Error');
    logger.info(error.message);
  });

module.exports = app;
