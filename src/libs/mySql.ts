import mysql from 'mysql2/promise';

// Configuration de la connexion à la base de données
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'test',
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // SSL configuration - remove if not needed or set to proper SslOptions
    // ssl: false
};

console.log('🔗 Configuration DB:', { 
  host: dbConfig.host, 
  user: dbConfig.user, 
  database: dbConfig.database, 
  port: dbConfig.port,
  password: dbConfig.password
});

// Création du pool de connexions
const pool = mysql.createPool(dbConfig);

// console.log('🔗 Pool de connexions créé', pool);

// Fonction pour tester la connexion
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    // console.log('✅ Connexion à la base de données réussie');
    connection.release();
    return true;
  } catch (error : any) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    return false;
  }
}

// Fonction pour exécuter des requêtes
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const data = await pool.execute(query, params);
    
    const [results] = data;
    return results;
  } catch (error : any) {
    console.error('Erreur lors de l\'exécution de la requête:', error);
    throw error;
  }
}

// Fonction pour exécuter des requêtes avec gestion des transactions
export async function executeTransaction(queries: { query: string; params?: any[] }[]) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params || []);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export default pool;
