const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const cron = require('node-cron');

// Custom Requires
const { sequelize } = require('../models');

const config = require('./config/vars');
const logger = require('./config/logger');
const routes = require('./routes');
const response = require('./utility/response');
const rescodes = require('./utility/rescodes');
// const sampleData = require('../src/data/generalDate');

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

// connect database

// const filePath = 'C:\\Users\\Manikandan\\Downloads\\sampleData.xlsx';
const filePath = path.join(__dirname, '../src/data/sampleData.xlsx');
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet);

let rowIndex = 0;

// Function to insert data and update "Op Finish Time"
function insertDataAndUpdateTime() {
  if (rowIndex >= data.length) {
    console.log('All data inserted.');
    return;
  }

  const rowData = data[rowIndex];

  // Assuming row data is in the correct format
  const newRow = {
    Op_Finish_Time: new Date(),
    dest_Operation: rowData['Dest Operation'],
    Associate_Id: rowData['Associate Id'],
    Mfg_Order_Id: rowData['Mfg Order Id'],
    product_id: '21JKS14D00',
    Serial_Num: rowData['Serial Num'],
    Operation_Id: rowData['Operation Id'],
    Work_Position_Id: rowData['Work Position Id'],
    line: 'L1', // Assuming lineDetails is defined somewhere
    isActive: true,
    deletedAt: null,
  };
  sampleData
    .create(newRow)
    .then(() => {
      rowIndex++;
    })
    .catch((error) => {
      console.error('Error inserting row:', error);
    });
}

// Schedule the insertion of data every 14 seconds
cron.schedule('*/30 * * * * *', () => {
  insertDataAndUpdateTime();
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
