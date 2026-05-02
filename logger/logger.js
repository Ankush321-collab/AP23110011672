export const logger = {
    info: (message, meta = {}) => {
        process.stdout.write(JSON.stringify({ level: 'INFO', timestamp: new Date().toISOString(), message, meta }) + '\n');
    },
    error: (message, error = {}) => {
        process.stderr.write(JSON.stringify({ level: 'ERROR', timestamp: new Date().toISOString(), message, error }) + '\n');
    }
};
