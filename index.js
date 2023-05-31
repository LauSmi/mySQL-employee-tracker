const mysql = require('mysql2');
const inquirer = require('inquirer');


//Creating connection
const connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '********',
    database: 'employee_db',
});

//Menu prompts
const menuPrompt = () => {
    inquirer
        .prompt({
            type: 'list',
            name: 'menu',
            message: 'What would you like to do?',
            choices: [
                'View all employees',
                'Add an employee',
                'Update an employee role',
                'View all roles',
                'Add a role',
                'View all departments',
                'Add a department',
                'Exit',
            ],
        })
        .then(handleMenuChoice);
};

const handleMenuChoice = (response) => {
    switch (response.menu) {
        case 'View all employees':
            viewEmployees();
            break;
        case 'Add an employee':
            addEmployee();
            break;
        case 'Update an employee role':
            updateRole();
            break;
        case 'View all roles':
            viewRoles();
            break;
        case 'Add a role':
            addRole();
            break;
        case 'View all departments':
            viewDepartments();
            break;
        case 'Add a department':
            addDepartment();
            break;
        default:
            connection.end();
            break;
    }
};


//VIEW employees function
const viewEmployees = () => {
    const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name, 
    CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee
    LEFT JOIN role ON role.id = employee.role_id
    JOIN department ON department.id = role.department_id
    LEFT JOIN employee AS manager ON manager.id = employee.manager_id
    ORDER BY employee.id`;

    connection.query(query, (error, data) => {
        if (error) {
            console.log(error);
        } else {
            console.table(data);
            menuPrompt();
        }
    });
};


//ADD an employee
const addEmployee = async () => {
    try {
        const [allRoles, allEmployees] = await Promise.all([fetchRoles(), fetchEmployees()]);

        const response = await inquirer.prompt([
            {
                type: 'input',
                name: 'first_name',
                message: "Enter the employee's first name.",
            },
            {
                type: 'input',
                name: 'last_name',
                message: "Enter the employee's last name.",
            },
            {
                type: 'list',
                name: 'role',
                message: "Enter the employee's role.",
                choices: allRoles,
            },
            {
                type: 'list',
                name: 'manager',
                message: "Enter the employee's manager.",
                choices: allEmployees,
            },
        ]);

        const { first_name, last_name, role, manager } = response;
        const roleId = role.split(' ')[0];
        const managerId = manager.split(' ')[0];
        const queryValues = managerId === '0' ? [first_name, last_name, roleId] : [first_name, last_name, roleId, managerId];
        const query = managerId === '0'
            ? `INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?);`
            : `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?);`;

        await executeQuery(query, queryValues);
        console.log(`Added ${first_name} ${last_name} to the database`);
        menuPrompt();
    } catch (error) {
        console.log(error);
    }
};

const fetchRoles = () => {
    const query = 'SELECT * FROM role';
    return executeQuery(query).then((data) => data.map((role) => `${role.id} ${role.title}`));
};

const fetchEmployees = () => {
    const query = 'SELECT * FROM employee';
    return executeQuery(query).then((data) => ['0 None'].concat(data.map((employee) => `${employee.id} ${employee.first_name} ${employee.last_name}`)));
};

const executeQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
};

//UPDATE employee role
const updateRole = async () => {
    try {
        const [roles, employees] = await Promise.all([fetchRoles(), fetchEmployees()]);

        const response = await inquirer.prompt([
            {
                type: 'list',
                name: 'employee',
                message: "Choose the employee you would like to update",
                choices: employees,
            },
            {
                type: 'list',
                name: 'role',
                message: 'Which role do you want to assign to the selected employee?',
                choices: roles,
            },
        ]);

        const roleId = response.role.split(' ')[0];
        const employeeId = response.employee.split(' ')[0];

        const query = 'UPDATE employee SET role_id = ? WHERE id = ?;';
        await executeQuery(query, [roleId, employeeId]);
        console.log(`Updated employee's role`);
        menuPrompt();
    } catch (error) {
        console.log(error);
    }
};


//VIEW employee roles
const viewRoles = () => {
    const query = `SELECT role.id, role.title, role.salary, department.name AS department FROM role
    INNER JOIN department on role.department_id = department.id`;

    connection.query(query, (error, data) => {
        if (error) {
            console.log(error);
        } else {
            console.table(data);
            menuPrompt();
        }
    });
};

// ADD employee role
const addRole = async () => {
    try {
        const departments = await query('SELECT * FROM department');
        const allDepartments = departments.map((department) => `${department.id}-${department.name}`);

        const response = await inquirer.prompt([
            {
                type: 'input',
                name: 'role',
                message: 'What is the name of the role?',
            },
            {
                type: 'input',
                name: 'salary',
                message: 'What is the salary of the role?',
            },
            {
                type: 'list',
                name: 'department',
                message: 'Which department does the role belong to?',
                choices: allDepartments,
            },
        ]);

        const [departmentId, departmentName] = response.department.split('-');
        const query = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?);`;
        await executeQuery(query, [response.role, response.salary, departmentId]);

        console.log(`Added ${response.role} to the database`);
        menuPrompt();
    } catch (error) {
        console.log(error);
    }
};



// VIEW departments
const viewDepartments = async () => {
    try {
        const query = `SELECT department.id, department.name AS department FROM department`;
        const data = await executeQuery(query);
        console.table(data);
        menuPrompt();
    } catch (error) {
        console.log(error);
    }
};

// ADD department
const addDepartment = async () => {
    try {
        const response = await inquirer.prompt([
            {
                type: 'input',
                name: 'department',
                message: 'What is the name of the department?',
            },
        ]);

        const query = `INSERT INTO department (name) VALUES (?);`;
        await executeQuery(query, [response.department]);

        console.log(`Added ${response.department} to the database`);
        menuPrompt();
    } catch (error) {
        console.log(error);
    }
};


menuPrompt();
