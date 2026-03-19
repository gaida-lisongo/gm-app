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
    connectTimeout: 30000,        // 30 secondes
    acquireTimeout: 30000,        // 30 secondes
    enableKeepAlive: true,
    keepAliveInitialDelayMs: 0,
    // SSL configuration - remove if not needed or set to proper SslOptions
    // ssl: false
};



console.log('🔗 Configuration DB:', { 
  host: dbConfig.host, 
  user: dbConfig.user, 
  database: dbConfig.database, 
  port: dbConfig.port,
  password: dbConfig.password ? '***' : ''
});

// Création du pool de connexions
let pool: any = null;
let connectionAttempts = 0;
const MAX_RETRIES = 3;

async function initPool() {
  try {
    pool = mysql.createPool(dbConfig);
    await testConnection();
    console.log('✅ Pool de connexions créé avec succès');
    return pool;
  } catch (error: any) {
    connectionAttempts++;
    console.error(`❌ Erreur création pool (tentative ${connectionAttempts}/${MAX_RETRIES}):`, error.message);
    
    if (connectionAttempts < MAX_RETRIES) {
      console.log(`⏳ Nouvelle tentative dans 5 secondes...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return initPool();
    }
    throw error;
  }
}

// Initialiser le pool
initPool().catch(error => {
  console.error('❌ Impossible d\'initialiser le pool MySQL:', error.message);
});


// Fonction pour tester la connexion
export async function testConnection() {
  try {
    if (!pool) throw new Error('Pool non initialisé');
    const connection = await Promise.race([
      pool.getConnection(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Test connection timeout')), 15000)
      )
    ]);
    console.log('✅ Connexion à la base de données réussie');
    (connection as any).release();
    return true;
  } catch (error : any) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    return false;
  }
}

// Fonction pour exécuter des requêtes avec retry
export async function executeQuery(query: string, params: any[] = [], retries = 2) {
  if (!pool) {
    throw new Error('Pool de connexions non initialisé. Vérifiez la configuration MySQL.');
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const data = await Promise.race([
        pool.execute(query, params),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query execution timeout')), 20000)
        )
      ]);
      
      const [results] = data;
      return results;
    } catch (error : any) {
      console.error(`Tentative ${attempt + 1}/${retries + 1} échouée:`, error.message);
      
      if (attempt < retries && error.code === 'ETIMEDOUT') {
        console.log(`⏳ Nouvelle tentative dans 5 secondes...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }
      
      console.error('Erreur lors de l\'exécution de la requête:', error);
      throw error;
    }
  }
}

// Fonction pour exécuter des requêtes avec gestion des transactions et retry
export async function executeTransaction(queries: { query: string; params?: any[] }[], retries = 1) {
  if (!pool) {
    throw new Error('Pool de connexions non initialisé');
  }

  let connection: any = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      connection = await Promise.race([
        pool.getConnection(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Get connection timeout')), 15000)
        )
      ]);
      
      await connection.beginTransaction();
      
      const results = [];
      for (const { query, params } of queries) {
        const [result] = await connection.execute(query, params || []);
        results.push(result);
      }
      
      await connection.commit();
      connection.release();
      return results;
    } catch (error: any) {
      if (connection) {
        try {
          await connection.rollback();
        } catch (rollbackError) {
          console.error('Erreur lors du rollback:', rollbackError);
        }
        connection.release();
      }
      
      console.error(`Tentative transaction ${attempt + 1}/${retries + 1} échouée:`, error.message);
      
      if (attempt < retries && error.code === 'ETIMEDOUT') {
        console.log(`⏳ Nouvelle tentative transaction dans 5 secondes...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }
      
      throw error;
    }
  }
}

// Exporter une fonction pour obtenir le pool
export function getPool() {
  return pool;
}

// Exporter une fonction pour fermer le pool proprement
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✅ Pool de connexions fermé');
  }
}


export default pool;
