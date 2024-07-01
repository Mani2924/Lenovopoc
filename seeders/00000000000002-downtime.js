const downtimeData = [
  {
    downTime: "15 mins",
    interval: "03:00 - 04:00 pm",
    message: "Conveyor is stopped",
    shift: "1",
    isActive: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    downTime: "5 mins",
    interval: "03:00 - 04:00 pm",
    message: "Parts Issue",
    shift: "1",
    isActive: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    downTime: "20 mins",
    interval: "03:00 - 04:00 pm",
    message: "Power Cut",
    shift: "1",
    isActive: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    downTime: "12 mins",
    interval: "03:00 - 04:00 pm",
    message: "Operator Trainer",
    shift: "1",
    isActive: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    downTime: "18 mins",
    interval: "03:00 - 04:00 pm",
    message: "Conveyor is stopped",
    shift: "1",
    isActive: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    downTime: "16 mins",
    interval: "03:00 - 04:00 pm",
    message: "Operator Trainer",
    shift: "1",
    isActive: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];


module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insert data into the 'downtime' table
    await queryInterface.bulkInsert('downtime', downtimeData, {});
  },

  down: async (queryInterface, Sequelize) => {
    // Delete data from the 'downtime' table
    await queryInterface.bulkDelete('downtime', null, {});
  }
};