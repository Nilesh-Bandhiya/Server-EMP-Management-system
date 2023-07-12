const { sequelize } = require("../config/database");
const XLSX = require("xlsx");
const moment = require("moment");

const uploadEmployees = async (file) => {
  try {
    const workbook = XLSX.read(file.data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const dateFmt = "DD/MM/YYYY";
    const options = {
      raw: false,
      dateNF: dateFmt,
      cellDates: true,
      dateNF: 'yyyy-mm-dd"T"hh:mm:ss.000Z',
    };
    let data = XLSX.utils.sheet_to_json(sheet, options);

    data = data.map((d) => {
      d.birth_date = moment(new Date(d.birth_date));
      return d;
    });

    const keys = Object.keys(data[0]);

    //for remove old table
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'employees'
      )`;
    const checkTableResult = await sequelize.query(checkTableQuery);

    if (checkTableResult[1].rows[0].exists) {
      // Table exists, drop the existing table
      const dropTableQuery = `DROP TABLE "employees"`;
      await sequelize.query(dropTableQuery);
    }

    //for add new data
    const assignType = (value) => {
      if (typeof value === "string") {
        return "VARCHAR(255) DEFAULT NULL";
      } else if (!isNaN(value) && Number.isInteger(parseInt(value))) {
        return "BIGINT DEFAULT NULL";
      } else {
        return "VARCHAR(255) DEFAULT NULL";
      }
    };

    const columns = keys.map((key) => {
      const columnName = key;
      return `"${columnName}" ${assignType(data[0][key])}`;
    });

    const createTableQuery = `CREATE TABLE "employees" ( "id" SERIAL PRIMARY KEY , ${columns.join(
      ", "
    )})`;

    await sequelize.query(createTableQuery);

    for (const item of data) {
      const insertValues = keys
        .map((key) => {
          if (item[key] === null) {
            return "NULL";
          }
          return `'${item[key]}'`;
        })
        .join(", ");

      const insertValuesQuery = `INSERT INTO "employees" (${keys
        .map((key) => `"${key}"`)
        .join(", ")}) VALUES (${insertValues})`;
      await sequelize.query(insertValuesQuery);
    }
  } catch (error) {
    throw new Error(error);
  }
};

const getAllEmployees = async () => {
  try {
    const response = await sequelize.query('SELECT * FROM "employees"');
    return response[0];
  } catch (error) {
    throw new Error(error);
  }
};

const getEmployeeById = async (id) => {
  try {
    const employee = await sequelize.query(
      `SELECT * FROM "employees" WHERE id = ${id}`
    );
    if (employee[0].length <= 0) {
      throw new Error("Employee Not Found");
    } else {
      const response = await sequelize.query(
        `SELECT * FROM "employees" WHERE id=${id}`
      );
      console.log(response[0]);
      return response[0];
    }
  } catch (error) {
    throw new Error(error);
  }
};

const createEmployee = async (data) => {
  console.log(Object.values(data).toString());
  try {
    await sequelize.query(
      `INSERT INTO "employees" (${Object.keys(
        data
      ).toString()}) VALUES (${Object.values(data)
        .map((value) => `'${value}'`)
        .join(",")});`
    );
  } catch (error) {
    throw new Error(error);
  }
};

const updateEmployee = async (data, id) => {
  try {
    const employee = await sequelize.query(
      `SELECT * FROM "employees" WHERE id = ${id}`
    );
    if (employee[0].length <= 0) {
      throw new Error("Employee Not Found");
    } else {
      let text = "";
      Object.entries(data).forEach((e) => {
        text = text + `${e[0]} = '${e[1]}', `;
      });
      //for remove last of text
      text = text.replace(/,\s*$/, "");
      //update query for employee
      await sequelize.query(`UPDATE "employees" SET ${text} WHERE id=${id};`);
    }
  } catch (error) {
    throw new Error(error);
  }
};

const deleteEmployee = async (id) => {
  try {
    const employee = await sequelize.query(
      `SELECT * FROM "employees" WHERE id = ${id}`
    );
    if (employee[0].length <= 0) {
      throw new Error("Employee Not Found");
    } else {
      await sequelize.query(`DELETE FROM "employees" WHERE id = ${id}`);
    }
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  uploadEmployees,
};
