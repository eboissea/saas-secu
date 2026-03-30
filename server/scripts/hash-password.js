import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
    console.log('Usage: node scripts/hash-password.js <password>');
    process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log(`\nPassword hash (bcrypt, 12 rounds):\n${hash}\n`);
console.log('Add this to your .env file as ADMIN_PASSWORD_HASH');
