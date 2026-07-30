import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log(__dirname);
console.log(path.join(__dirname, '..', '..', 'uploads'));
