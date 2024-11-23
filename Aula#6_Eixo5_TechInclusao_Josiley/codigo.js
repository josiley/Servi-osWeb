const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt'); // Importa o bcrypt para hashing de senhas

// Cria a conexão apenas uma vez
const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sua_senha',
    database: 'seu_banco',
});

// Função para validar o nome de usuário
function validarNomeUsuario(nome) {
    // Expressão regular: apenas caracteres alfanuméricos e entre 3 e 20 caracteres
    const regex = /^[a-zA-Z0-9]{3,20}$/;

    if (!regex.test(nome)) {
        if (nome.length < 3) {
            return 'O nome deve ter pelo menos 3 caracteres.';
        } else if (nome.length > 20) {
            return 'O nome não pode ter mais de 20 caracteres.';
        } else {
            return 'O nome deve conter apenas caracteres alfanuméricos.';
        }
    }

    return 'Nome válido!';
}

// Função para buscar um usuário pelo nome
async function buscarUsuarioPorNome(nome) {
    try {
        // Query para buscar um usuário pelo nome
        const query = 'SELECT * FROM usuarios WHERE nome = ?';
        
        // Executa a query com prepared statements
        const [rows] = await connection.execute(query, [nome]);

        // Verifica se o usuário foi encontrado
        if (rows.length === 0) {
            console.log('Usuário não encontrado.');
            return null; // Retorna null se o usuário não for encontrado
        }

        return rows[0]; // Retorna o primeiro usuário encontrado
    } catch (error) {
        console.error('Erro ao buscar usuário:', error.message);
        throw error; // Lança o erro para tratamento externo, se necessário
    }
}

// Função para atualizar a senha do usuário
async function atualizarSenha(nome, novaSenha) {
    try {
        // Verifica se o nome do usuário existe no banco
        const usuario = await buscarUsuarioPorNome(nome);
        
        if (!usuario) {
            console.log('Usuário não encontrado. Não foi possível atualizar a senha.');
            return;
        }

        // Gera o hash da nova senha com um fator de custo 10
        const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

        // Query para atualizar a senha no banco
        const query = 'UPDATE usuarios SET senha = ? WHERE nome = ?';
        const [result] = await connection.execute(query, [novaSenhaHash, nome]);

        // Verifica se a atualização foi bem-sucedida
        if (result.affectedRows === 0) {
            console.log('Nenhuma linha foi atualizada. Verifique o nome do usuário.');
        } else {
            console.log('Senha do usuário atualizada com sucesso.');
        }
        
    } catch (error) {
        console.error('Erro ao atualizar a senha:', error.message);
        throw error; // Lança o erro para tratamento externo, se necessário
    }
}

// Função para buscar um usuário pelo login (email)
async function buscarUsuarioPorLogin(email) {
    try {
        // Query para buscar um usuário pelo email (login)
        const query = 'SELECT * FROM usuarios WHERE email = ?';
        
        // Executa a query com prepared statements
        const [rows] = await connection.execute(query, [email]);

        // Verifica se o usuário foi encontrado
        if (rows.length === 0) {
            console.log('Usuário não encontrado.');
            return null; // Retorna null se o usuário não for encontrado
        }

        return rows[0]; // Retorna o primeiro usuário encontrado

    } catch (error) {
        console.error('Erro ao buscar usuário:', error.message);
        throw error; // Lança o erro para tratamento externo, se necessário
    }
}

// Função para inserir um novo usuário no banco
async function inserirUsuario(nome, email, senha) {
    // Valida o nome do usuário
    const nomeValidacao = validarNomeUsuario(nome);
    if (nomeValidacao !== 'Nome válido!') {
        console.log(nomeValidacao); // Retorna a mensagem de erro de validação
        return;
    }

    try {
        // Gera o hash da senha com um fator de custo 10
        const senhaHash = await bcrypt.hash(senha, 10);

        // Query para inserir os dados no banco
        const query = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
        const [result] = await connection.execute(query, [nome, email, senhaHash]);

        console.log('Usuário inserido com sucesso. ID:', result.insertId);
        return result.insertId; // Retorna o ID do novo usuário
    } catch (error) {
        console.error('Erro ao inserir usuário:', error.message);
        throw error; // Lança o erro para tratamento externo, se necessário
    }
}

// Exemplo de uso
(async () => {
    try {
        // Exemplo de inserção de novo usuário
        const id1 = await inserirUsuario('João123', 'joao@example.com', 'senhaSegura123');
        console.log('Novo usuário inserido com ID:', id1);

        // Exemplo de busca de usuário por login (e-mail)
        const usuario = await buscarUsuarioPorLogin('joao@example.com');
        if (usuario) {
            console.log('Dados do usuário:', usuario);
        }

        // Atualizando a senha de um usuário
        await atualizarSenha('João123', 'novaSenhaSegura123');
    } catch (error) {
        console.error('Erro:', error);
    } finally {
        // Fecha a conexão ao terminar todas as operações
        await connection.end();
        console.log('Conexão encerrada.');
    }
})();
