const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// Lista negra de tokens (armazenada em um Set)
const listaNegraTokens = new Set();

// Função para revogar um token (adicionando-o à lista negra)
function revogarToken(token) {
    // Adiciona o token à lista negra
    listaNegraTokens.add(token);
    console.log('Token revogado com sucesso!');
}

// Função para verificar se um token está na lista negra (revogado)
function verificarTokenRevogado(token) {
    if (listaNegraTokens.has(token)) {
        console.log('Token revogado.');
        return true; // O token está revogado
    }
    console.log('Token não revogado.');
    return false; // O token não está revogado
}

// Função para verificar a validade do token, levando em consideração a lista negra
async function verificarTokenValido(token, secret) {
    if (verificarTokenRevogado(token)) {
        return 'Token revogado.';
    }

    try {
        // Verifica e decodifica o token JWT
        const decoded = jwt.verify(token, secret);
        console.log('Token válido:', decoded);
        return decoded;
    } catch (error) {
        console.error('Erro ao verificar o token:', error.message);
        return 'Token inválido.';
    }
}

// Função para gerar um token JWT (para testes)
function gerarToken(usuario, secret) {
    const token = jwt.sign({ usuario: usuario }, secret, { expiresIn: '1h' });
    console.log('Token gerado:', token);
    return token;
}

// Função para criar a conexão com o banco de dados
let connection;

async function criarConexao() {
    if (!connection) {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'sua_senha',
            database: 'seu_banco',
        });
    }
    return connection;
}

// Função para validar o nome do usuário com regex
function validarNomeUsuario(nome) {
    const regex = /^[a-zA-Z0-9]{3,20}$/; // Somente alfanumérico, entre 3 e 20 caracteres
    if (!regex.test(nome)) {
        throw new Error('Nome de usuário inválido. Deve conter apenas caracteres alfanuméricos e ter entre 3 e 20 caracteres.');
    }
}

// Função para inserir um novo usuário com validação e bcrypt
async function inserirUsuario(nome, email, senha) {
    try {
        // Valida o nome do usuário
        validarNomeUsuario(nome);

        // Cria a conexão
        const conn = await criarConexao();

        // Criptografa a senha usando bcrypt
        const senhaHash = await bcrypt.hash(senha, 10);

        // Consulta SQL para inserir o novo usuário
        const query = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';

        // Executa a query com prepared statements
        const [result] = await conn.execute(query, [nome, email, senhaHash]);

        console.log('Usuário inserido com sucesso. ID:', result.insertId);

        // Fecha a conexão
        await conn.end();

        return result.insertId; // Retorna o ID do novo usuário
    } catch (error) {
        console.error('Erro ao inserir usuário:', error.message);
        throw error; // Lança o erro para tratamento externo, se necessário
    }
}

// Função para buscar um usuário pelo login
async function buscarUsuarioPorLogin(email) {
    try {
        const conn = await criarConexao();

        const query = 'SELECT * FROM usuarios WHERE email = ?';
        const [rows] = await conn.execute(query, [email]);

        if (rows.length === 0) {
            console.log('Usuário não encontrado.');
            await conn.end();
            return null;
        }

        console.log('Usuário encontrado:', rows[0]);
        await conn.end();
        return rows[0];
    } catch (error) {
        console.error('Erro ao buscar usuário:', error.message);
        throw error;
    }
}

// Função para atualizar a senha do usuário
async function atualizarSenha(nome, novaSenha) {
    try {
        // Valida o nome do usuário
        validarNomeUsuario(nome);

        // Cria a conexão
        const conn = await criarConexao();

        // Verifica se o usuário existe no banco
        const [rows] = await conn.execute('SELECT * FROM usuarios WHERE nome = ?', [nome]);
        if (rows.length === 0) {
            console.log('Usuário não encontrado.');
            await conn.end();
            return 'Usuário não encontrado.';
        }

        // Criptografa a nova senha usando bcrypt
        const senhaHash = await bcrypt.hash(novaSenha, 10);

        // Atualiza a senha no banco de dados
        const query = 'UPDATE usuarios SET senha = ? WHERE nome = ?';
        const [result] = await conn.execute(query, [senhaHash, nome]);

        if (result.affectedRows === 0) {
            console.log('Erro ao atualizar a senha.');
            await conn.end();
            return 'Erro ao atualizar a senha.';
        }

        console.log('Senha atualizada com sucesso.');
        await conn.end();
        return 'Senha atualizada com sucesso.';
    } catch (error) {
        console.error('Erro ao atualizar a senha:', error.message);
        throw error;
    }
}

// Exemplo de uso
const secret = 'secretaChave';

// Gerando um token JWT para um usuário de exemplo
const token = gerarToken('usuarioExemplo', secret);

// Verificando o token antes de revogá-lo
verificarTokenValido(token, secret);

// Revogando o token
revogarToken(token);

// Verificando o token após revogá-lo
verificarTokenValido(token, secret);

// Exemplo de inserção de usuário
(async () => {
    try {
        const id = await inserirUsuario('Joao123', 'joao@example.com', 'senhaSegura123');
        console.log('Novo usuário inserido com ID:', id);
    } catch (error) {
        console.error('Erro ao inserir usuário:', error);
    }

    // Exemplo de buscar usuário por login
    const usuario = await buscarUsuarioPorLogin('joao@example.com');
    if (usuario) {
        console.log('Usuário encontrado:', usuario);
    }

    // Exemplo de atualização de senha
    const resultado = await atualizarSenha('Joao123', 'novaSenhaSegura456');
    console.log(resultado);
})();
