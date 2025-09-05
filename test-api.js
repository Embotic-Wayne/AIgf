// Simple test for the API function
const handler = require('./api/index.js');

// Mock request and response
const mockReq = {
  method: 'POST',
  body: {
    message: 'Hello, how are you?',
    character: { name: 'Nezuko', personality: 'Sweet and caring' }
  }
};

const mockRes = {
  status: (code) => ({
    json: (data) => {
      console.log('Status:', code);
      console.log('Response:', data);
    }
  }),
  setHeader: () => {},
  end: () => console.log('OPTIONS handled')
};

// Test the function
handler(mockReq, mockRes).catch(console.error);
