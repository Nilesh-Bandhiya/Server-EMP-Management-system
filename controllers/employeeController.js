const XLSX = require("xlsx");
const {
  getAllEmployees,
  deleteEmployee,
  updateEmployee,
  getEmployeeById,
  createEmployee,
  uploadEmployees,
} = require("../helpers/employeeHelper");

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await getAllEmployees();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employees" });
  }
};

exports.getEmployeeById = async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await getEmployeeById(id);
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

exports.uploadEmployees = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.files.file;

    await uploadEmployees(file);

    res.status(200).json({ message: "Employee data uploaded successfully" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const createdEmployee = await createEmployee(req.body);

    res.status(201).json(createdEmployee);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

exports.updateEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    await updateEmployee(req.body, id);

    res.status(200).json({ message: "Employee updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteEmployee(id);
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
