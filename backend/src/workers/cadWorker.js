const Queue = require('bull');
require('dotenv').config();

// Conectamos Bull a nuestro Redis local
const cadQueue = new Queue('procesamiento-cad', process.env.REDIS_URL);

// Definimos el "Worker" (el obrero que procesa la tarea en segundo plano)
cadQueue.process(async (job) => {
    console.log(`Iniciando procesamiento del archivo CAD ID: ${job.id}`);
    
    // Aquí simulamos el tiempo que tardaría el algoritmo de IA en validar la geometría
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`✅ Archivo CAD procesado. Geometría validada. Resultado enviado a ${job.data.usuario}`);
            resolve({ estatus: 'Completado', manufacturable: true });
        }, 5000); // Simula 5 segundos de carga de procesamiento
    });
});

module.exports = cadQueue;