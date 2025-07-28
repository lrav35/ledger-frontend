import indexHtml from "./public/index.html";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080";

console.log('Setting up server with routes:', Object.keys({
  "/": indexHtml,
  "/api/attendees": { GET: async () => {} },
  "/test": { GET: () => {} }
}));


// Bun.serve({
//   port: 3000,
//   routes: {
//     "/": indexHtml,
//     "/api/attendees": {
//       GET: async () => {
//         console.log('ATTENDEES ENDPOINT HIT');
//         return new Response("ATTENDEES RESPONSE");
//       }
//     },
//     "/test": {
//       GET: () => {
//         console.log('TEST ENDPOINT HIT');
//         return new Response("Hello World");
//       }
//     }
//   }
// });

Bun.serve({
  port: 3000,
  routes: {
    "/": indexHtml,
    "/api/attendees": {
      GET: async () => {
        console.log('GET /api/attendees called');

    console.log('GET /api/attendees called');
    console.log('Current working directory:', process.cwd());
    console.log('__dirname equivalent:', import.meta.dir); // Bun specific
        try {
      const filePath = "./attendees.txt";
      console.log('Trying to read file at path:', filePath);
      
      const attendeesFile = Bun.file(filePath);
      console.log('File object created');
      
      // Check if file exists
      const exists = await attendeesFile.exists();
      console.log('File exists:', exists);


      if (!exists) {
        console.log('File does not exist at path:', filePath);
        return new Response(JSON.stringify({ 
          error: 'File not found',
          path: filePath,
          cwd: process.cwd()
        }), {
          status: 404,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
          
      const size = await attendeesFile.size;
      console.log('File size:', size, 'bytes');
      
      const attendeesText = await attendeesFile.text();
      console.log('File content length:', attendeesText.length);
      console.log('Raw file content:', JSON.stringify(attendeesText));
      
      const attendeesList = attendeesText.split('\n').filter(name => name.trim() !== '');
      console.log('Parsed attendees:', attendeesList);
      
      return new Response(JSON.stringify(attendeesList), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
        } catch (error) {
          console.error('Error loading attendees:', error);
          console.error('Error stack:', error.stack);
          
          return new Response(JSON.stringify({ 
            error: 'Failed to load attendees',
            message: error.message 
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      }
    },
    "/api/expenses": {
      POST: async (req) => {
        try {
          const body = await req.json();
          const response = await fetch(`${API_BASE_URL}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          const data = await response.json();
          return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({ error: 'Failed to add expense' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    },
    "/api/payments": {
      POST: async (req) => {
        try {
          const body = await req.json();
          const response = await fetch(`${API_BASE_URL}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          const data = await response.json();
          return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({ error: 'Failed to add payment' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    },
    "/api/summary/:event": {
      GET: async (req) => {
        try {
          const event = req.params.event;
          const response = await fetch(`${API_BASE_URL}/summary/${event}`);
          const data = await response.json();
          return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({ error: 'Failed to fetch summary' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }
  },
  development: {
    hmr: true,
    console: true,
  }
});

console.log("Server running on http://localhost:3000");
