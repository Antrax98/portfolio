//Se ejecuta antes de que Jest cargue los modulos del test, y por tanto antes
//que ConfigModule. dotenv no pisa lo que ya esta en process.env, asi que estas
//dos lineas ganan sobre el .env sin tener que tocarlo.
process.env.DB_NAME = process.env.E2E_DB_NAME ?? 'nestdb_test';

//Los e2e hacen decenas de peticiones seguidas: con el limite normal el
//throttler empezaria a devolver 429 a mitad de la suite, y el fallo dependeria
//del orden en que Jest ejecute los ficheros.
process.env.THROTTLE_LIMIT = '100000';
