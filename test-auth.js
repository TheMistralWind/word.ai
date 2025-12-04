const assert = require('assert');

function testAuth(authHeader, sitePassword) {
    if (!authHeader) return false;

    const authValue = authHeader.split(' ')[1];
    const decoded = Buffer.from(authValue, 'base64').toString();
    // Original logic: const [user, pwd] = decoded.split(':');

    // Proposed fix logic:
    const splitIndex = decoded.indexOf(':');
    if (splitIndex === -1) return false;

    const user = decoded.substring(0, splitIndex);
    const pwd = decoded.substring(splitIndex + 1);

    console.log(`User: ${user}, Password: ${pwd}`);

    return pwd === sitePassword;
}

// Test cases
const password = "secret:password"; // Password with colon
const credentials = Buffer.from(`admin:${password}`).toString('base64');
const header = `Basic ${credentials}`;

console.log("Testing password with colon...");
const result = testAuth(header, password);
console.log(`Result: ${result}`);

if (result) {
    console.log("SUCCESS: Logic handles colons correctly.");
} else {
    console.log("FAILURE: Logic failed.");
}
