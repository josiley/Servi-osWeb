CREATE TABLE usuarios(
  idUsuario INTEGER AUTOINCREMENT PRIMARY KEY,
  nome TEXT NOT NULL
);

INSERT into usuarios (nome) VALUES ('Carlos Sousa'), ('Ana Silva');

UPDATE usuarios SET nome='Carlos Almeida' WHERE nome='Carlos Sousa';
/*OU UPDATE usuarios SET nome='Carlos Almeida' WHERE idUsuario=1;*/

DELETE FROM usuarios WHERE nome='Ana Silva';
/*OU DELETE FROM usuarios WHERE idUsuario=2;*/

CREATE TABLE produtos(
  id INTEGER AUTOINCREMENT PRIMARY KEY,
  nome TEXT,
  preco FLOAT,
  estoque INTEGER
);

/*Substitua o ? por um valor*/
DELETE FROM produtos WHERE id=?;
