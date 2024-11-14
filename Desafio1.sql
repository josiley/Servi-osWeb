CREATE TABLE departments(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  location TEXT NOT NULL
);

CREATE TABLE employees(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    ('David', 2000.00, 3),
    ('Josiley', 3100.00, 2),
    ('Alice', 1300.00, 2);
    
SELECT * FROM employees;

SELECT * FROM departments;

SELECT employees.name AS 'nomeFuncionario', departments.name AS 'nomeDepartamento' FROM employees inner JOIN departments ON employees.department_id=departments.id;

SELECT employees.name AS 'nomeFuncionario', departments.name AS 'nomeDepartamento' FROM employees inner JOIN departments ON employees.department_id=departments.id WHERE employees.salary > 6000.00;

UPDATE employees set salary=5500.00 where name='Alice';

DELETE FROM employees WHERE name='David';

SELECT name, salary FROM employees;
