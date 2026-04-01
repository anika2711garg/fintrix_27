const axios = require('axios');

exports.getFinancialInsights = async (financialData) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const prompt = `
    Analyze the following financial records for a user. 
    Provide a concise summary of their spending habits, identify any concerning trends, and give 3 actionable pieces of advice to improve their net balance.
    
    Data:
    Total Income: ${financialData.totalIncome}
    Total Expenses: ${financialData.totalExpenses}
    Net Balance: ${financialData.netBalance}
    Category Breakdown: ${JSON.stringify(financialData.categoryTotals)}
    
    Format your response in professional markdown. Keep it friendly but professional.
  `;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: 'You are a professional financial analyst assistant.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);
    throw new Error('Failed to generate AI insights');
  }
};
