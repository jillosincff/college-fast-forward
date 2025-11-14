import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Allow public access for sharing
    const bitlyToken = Deno.env.get('BITLY_ACCESS_TOKEN');
    
    if (!bitlyToken) {
      return new Response(JSON.stringify({ 
        error: 'Bitly token not configured' 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Use the correct app URL
    const appUrl = 'https://www.collegefastforward.com';
    
    console.log('Creating Bitly link for:', appUrl);
    
    // First, create the short link
    const bitlyResponse = await fetch('https://api-ssl.bitly.com/v4/shorten', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bitlyToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        long_url: appUrl,
        title: 'College Fast Forward - Get Gators Hired',
        tags: ['college-fast-forward', 'uf-gators']
      })
    });

    const responseText = await bitlyResponse.text();
    console.log('Bitly response status:', bitlyResponse.status);
    console.log('Bitly response:', responseText);

    if (!bitlyResponse.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { message: responseText };
      }
      
      // Check if it's just a duplicate (which is fine - means link already exists)
      if (errorData.description && errorData.description.includes('already')) {
        // Try to get existing link instead
        return new Response(JSON.stringify({
          short_link: 'https://bit.ly/collegeff',
          message: 'Using existing short link'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Return detailed error for debugging
      return new Response(JSON.stringify({ 
        error: 'Bitly API error',
        details: errorData,
        status: bitlyResponse.status
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = JSON.parse(responseText);
    const bitlinkId = data.id;
    
    // Now update the link with custom social metadata
    try {
      await fetch(`https://api-ssl.bitly.com/v4/bitlinks/${bitlinkId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${bitlyToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'College Fast Forward - Get Gators Hired',
          deeplinks: [],
          custom_bitlinks: []
        })
      });
    } catch (updateError) {
      console.log('Could not update link metadata:', updateError);
      // Non-fatal - continue anyway
    }

    return new Response(JSON.stringify({
      short_link: data.link,
      long_url: data.long_url,
      created_at: data.created_at
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error generating Bitly link:', error);
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