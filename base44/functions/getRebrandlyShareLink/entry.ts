import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const rebrandlyApiKey = Deno.env.get('REBRANDLY_API_KEY');
    
    if (!rebrandlyApiKey) {
      return new Response(JSON.stringify({ 
        error: 'Rebrandly API key not configured' 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const appUrl = 'https://app.collegefastforward.com';
    
    console.log('Creating Rebrandly link for:', appUrl);
    
    // Create branded short link with custom social metadata
    const rebrandlyResponse = await fetch('https://api.rebrandly.com/v1/links', {
      method: 'POST',
      headers: {
        'apikey': rebrandlyApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: appUrl,
        title: 'College Fast Forward - Get Gators Hired',
        // Custom social media preview
        slashtag: 'collegeff', // Try to get bit.ly/collegeff style URL
        // Social card metadata
        og: {
          title: 'College Fast Forward - Get Gators Hired',
          description: 'Turn family connections into career opportunities. Connect UF students with alumni and parents for internships, jobs, and career advice.',
          image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/b27e39f30_collegefastforwardlogo.png',
          type: 'website'
        }
      })
    });

    const responseText = await rebrandlyResponse.text();
    console.log('Rebrandly response status:', rebrandlyResponse.status);
    console.log('Rebrandly response:', responseText);

    if (!rebrandlyResponse.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { message: responseText };
      }
      
      // Check if link already exists
      if (errorData.errors && errorData.errors.some(e => e.code === 'AlreadyExists')) {
        // Return existing link
        return new Response(JSON.stringify({
          short_link: 'https://rebrand.ly/collegeff',
          message: 'Using existing short link'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ 
        error: 'Rebrandly API error',
        details: errorData,
        status: rebrandlyResponse.status
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = JSON.parse(responseText);

    return new Response(JSON.stringify({
      short_link: data.shortUrl,
      long_url: data.destination,
      created_at: data.createdAt
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error generating Rebrandly link:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate share link',
      details: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});