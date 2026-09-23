const axios = require('axios');
const cheerio = require('cheerio');
const rules = require('./accessibility-rules');

async function scanWebsite(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const issues = [];

    rules.forEach(rule => {
      const result = rule($);
      if (result) {
        issues.push({
          type: rule.type,
          description: rule.description,
          elements: result
        });
      }
    });

    return issues;
  } catch (error) {
    console.error(error);
    return [];
  }
}

module.exports = scanWebsite;