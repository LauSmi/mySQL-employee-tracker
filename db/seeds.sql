
USE employee_db;

INSERT INTO department (name)
VALUES ("Finance"),
    ("Communications"),
    ("Program"),
    ("Operations");

INSERT INTO role (title, salary, department_id)
VALUES ("Finance Director", 150000, 1),
    ("Finance Specialist", 80000, 1),
    ("Communications Director", 150000, 2),
    ("Communications Specialist", 85000, 2),
    ("Program Director", 95000, 3),
    ("Program Specialist", 75000, 3),
    ("Operations Director", 180000, 4),
    ("Operations Specialist", 75000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Laura", "Palmer", 1, NULL),
    ("Audrey", "Horne", 2, 1),
    ("Dale", "Cooper", 3, NULL),
    ("Leland", "Palmer", 4, 3),
    ("Log", "Lady", 5, NULL),
    ("Sinister", "Bob", 6, 5),
    ("Gordon", "Cole", 7, NULL),
    ("The Man", "From Another Place", 8, 7);