const BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

exports.handler = async function(event) {
  const params = event.queryStringParameters || {};
  const table = params.table;
  const record = params.record;

  if (!BASE_ID || !AIRTABLE_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing AIRTABLE_BASE_ID or AIRTABLE_TOKEN environment variable' }),
    };
  }

  if (!table) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required query parameter: table' }),
    };
  }

  let airtableUrl = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`;
  if (record) {
    airtableUrl += `/${record}`;
  } else {
    const query = new URLSearchParams();
    const multiParams = event.multiValueQueryStringParameters;

    if (multiParams && Object.keys(multiParams).length) {
      Object.entries(multiParams).forEach(([key, values]) => {
        if (key === 'table' || key === 'record') return;
        values.forEach(value => query.append(key, value));
      });
    } else {
      Object.entries(params).forEach(([key, value]) => {
        if (key === 'table' || key === 'record') return;
        query.append(key, value);
      });
    }

    const queryString = query.toString();
    if (queryString) airtableUrl += `?${queryString}`;
  }

  try {
    const response = await fetch(airtableUrl, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      },
    });

    const data = await response.text();
    return {
      statusCode: response.status,
      body: data,
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};