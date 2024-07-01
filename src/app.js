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
const { getFilteredData } = require('./services/generalSocket.service');
const xlsx = require('xlsx');
const { sampleData } = require('../models/index');

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
  socket.on('disconnect', () => {});
});

// Cron job to emit data every 15 seconds
cron.schedule('** * * * * *', async () => {
  try {
    const data = await getFilteredData();
    io.emit('dataUpdate', {
      totalCount: data.totalCount,
      timeRange: `${data.startHour} - ${data.endHour}`,
    });
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
