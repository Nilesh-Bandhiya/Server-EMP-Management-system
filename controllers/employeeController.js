const XLSX = require("xlsx");
const moment = require("moment");
const Employee = require("../models/employeeModel");

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll();
    res.status(200).json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
};

exports.getEmployeeById = async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employee" });
  }
};

exports.uploadEmployees = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.files.file;
    const workbook = XLSX.read(file.data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const dateFmt = "DD/MM/YYYY";
    const options = {
      raw: false,
      dateNF: dateFmt,
      cellDates: true,
      dateNF: 'yyyy-mm-dd"T"hh:mm:ss.000Z',
    };
    const data = XLSX.utils.sheet_to_json(sheet, options);

    await Employee.destroy({ truncate: true });

    const formattedData = data.map((item) => {
      const dynamicColumns = ["skills", "birth_date", "joining_date"];

      const filteredProperties = Object.fromEntries(
        Object.entries(item).filter(([key, value]) => {
          if (dynamicColumns.includes(key)) {
            return value !== null && value !== undefined;
          }
          return true;
        })
      );

      //ISSUE : Date conversion loses 1 day In xlsx
      //You can check this issue of date is still not resolved  `https://github.com/SheetJS/sheetjs/issues/1470`
      if (filteredProperties.birth_date) {
        filteredProperties.birth_date = moment(
          filteredProperties.birth_date
        ).add(1, "days");
      }

      if (filteredProperties.joining_date) {
        filteredProperties.joining_date = moment(
          filteredProperties.joining_date
        ).add(1, "days");
      }

      return filteredProperties;
    });

    await Employee.bulkCreate(formattedData);

    res.status(200).json({ message: "Employee data uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to upload employee data" });
  }
};

exports.createEmployee = async (req, res) => {
  if (req.body?.birth_date) {
    req.body.birth_date = moment(req.body.birth_date).add(1, "days");
  }

  if (req.body?.joining_date) {
    req.body.joining_date = moment(req.body.joining_date).add(1, "days");
  }

  try {
    const createdEmployee = await Employee.create(req.body);
    res.status(201).json(createdEmployee);
  } catch (error) {
    res.status(500).json({ message: "Failed to create employee" });
  }
};

exports.updateEmployee = async (req, res) => {
  const { id } = req.params;
  if (req.body?.birth_date) {
    req.body.birth_date = moment(req.body.birth_date).add(1, "days");
  }

  if (req.body?.joining_date) {
    req.body.joining_date = moment(req.body.joining_date).add(1, "days");
  }
  const { name, designation, salary, location, status, ...dynamicFields } = req.body;

  try {
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    employee.name = name;
    employee.designation = designation;
    employee.salary = salary;
    employee.location = location;
    employee.status = status;

    for (const field in dynamicFields) {
      if (Object.prototype.hasOwnProperty.call(dynamicFields, field)) {
        employee[field] = dynamicFields[field];
      }
    }

    await employee.save();

    res.status(200).json({ message: "Employee updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update employee" });
  }
};

exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    await employee.destroy();

    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete employee" });
  }
};
