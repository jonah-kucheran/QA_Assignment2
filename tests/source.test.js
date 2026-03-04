const { describe, it, test } = require("node:test");
const assert = require("node:assert");
const { isValidDate, isValidEmail } = require('../source');

describe("Testing my date validation", () => {
    test("Should validate properly", () => {
        assert.strictEqual(isValidDate('2005-05-26'), true);
        assert.strictEqual(isValidDate('2024-02-29'), true);
        assert.strictEqual(isValidDate('2009-03-31'), true);
        assert.strictEqual(isValidDate('205-01-01'), false);
        assert.strictEqual(isValidDate('1995-13-25'), false);
        assert.strictEqual(isValidDate('2015-04-31'), false);
        assert.strictEqual(isValidDate('2011-02-29'), false);
    });
});

describe("Testing my email validation", () => {
    test("Should validate properly", () => {
        assert.strictEqual(isValidEmail("jonah@email.com"), true);
        assert.strictEqual(isValidEmail("userNAME12345@gmAIL.ca"), true);
        assert.strictEqual(isValidEmail("user@gmail"), false);
        assert.strictEqual(isValidEmail("usernameAgmail.com"), false);
        assert.strictEqual(isValidEmail("hamburger"), false);
    });
});