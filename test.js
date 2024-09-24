
const fs = require('fs');

const PRIME = 2n ** 256n - 2n ** 32n - 977n;

function decodeValue(base, value) {
    return BigInt(parseInt(value, parseInt(base)));
}

function modInverse(a, m) {
    function egcd(a, b) {
        if (a === 0n) {
            return [b, 0n, 1n];
        } else {
            let [g, y, x] = egcd(b % a, a);
            return [g, x - (b / a) * y, y];
        }
    }

    let [g, x, _] = egcd(BigInt(a), BigInt(m));
    if (g !== 1n) {
        throw new Error('Modular inverse does not exist');
    } else {
        return ((x % m) + m) % m;
    }
}

function lagrangeInterpolation(points, k) {
    function product(values) {
        return values.reduce((acc, val) => (acc * val) % PRIME, 1n);
    }

    let secret = 0n;
    for (let [i, yi] of Object.entries(points)) {
        i = BigInt(i);
        yi = BigInt(yi);
        let numerator = product(Object.keys(points).filter(j => BigInt(j) !== i).map(BigInt));
        let denominator = product(Object.keys(points).filter(j => BigInt(j) !== i).map(j => (BigInt(j) - i + PRIME) % PRIME));
        let lagrangePolynomial = (numerator * modInverse(denominator, PRIME)) % PRIME;
        secret = (secret + yi * lagrangePolynomial) % PRIME;
    }

    return secret;
}

function processTestCase(testCase) {
    const { n, k } = testCase.keys;
    const points = {};

    for (let i = 1; i <= n; i++) {
        if (testCase[i]) {
            const point = testCase[i];
            const x = i;
            const y = decodeValue(point.base, point.value);
            points[x] = y;
        }
    }

    if (Object.keys(points).length < k) {
        throw new Error(`Not enough points provided. Need at least ${k}, but got ${Object.keys(points).length}.`);
    }

    return lagrangeInterpolation(Object.fromEntries(Object.entries(points).slice(0, k)), k);
}

const testCase = JSON.parse(fs.readFileSync('test_case.json', 'utf8'));

try {
    const secret = processTestCase(testCase);
    console.log(secret);
} catch (e) {
    console.error(`Error: ${e.message}`);
}
