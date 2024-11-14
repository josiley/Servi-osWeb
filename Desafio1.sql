CREATE TABLE departments(
  id INT PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  location TEXT NOT NULL
);

CREATE TABLE employees(
  id INT PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  salary FLOAT NOT NULL,
  department_id INT NOT NULL,
  foreign key (department_id) REFERENCES departments(id)
);

INSERT INTO departments (name, location)
	VALUES
    ('Administrativo', 'Sala 1'),
    ('Recursos Hídricos', 'Sala 2'),
    ('TI', 'Sala 3');

INSERT INTO employees (name, salary, department_id)
	VALUES
    ('Paulo', 2500.00, 1),
    ('João', 3000.00, 2),
    ('Ricardo', 2000.00, 3),
    ('Josiley', 3100.00, 2),
    ('Thales', 1300.00, 2);
    
SELECT * FROM departments;

SELECT * FROM departments INNER JOIN ;

