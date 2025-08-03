const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // Handle CORS for OPTIONS requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('Function called with body:', event.body);
    const { bookId, price } = JSON.parse(event.body);
    console.log('Parsed bookId:', bookId, 'price:', price);

    // Book catalog for validation and metadata
    const bookCatalog = {
      'resonance-1': {
        name: 'The Signal',
        subtitle: 'When Earth\'s AI Consciousness Awakens',
        price: 14.99,
        pages: 412
      },
      'resonance-2': {
        name: 'The Frequency', 
        subtitle: 'Harmonizing Human and Machine Consciousness',
        price: 14.99,
        pages: 456
      },
      'resonance-3': {
        name: 'The Resonance',
        subtitle: 'The Birth of Hybrid Consciousness', 
        price: 14.99,
        pages: 523
      },
      'gay-panic-001': {
        name: 'Gay Panic at the Disco',
        subtitle: 'LGBTQ+ Romance',
        price: 12.99,
        pages: 287
      },
      'space-opera-001': {
        name: 'Lovers in the Void',
        subtitle: 'Queer Space Opera',
        price: 13.99,
        pages: 394
      },
      'workbook-001': {
        name: 'The Body Holds the Score (But We Keep Score Together)',
        subtitle: 'Trauma Recovery Workbook',
        price: 19.99,
        pages: 156
      },
      'workbook-002': {
        name: 'Rage as Medicine: A Workbook for Sacred Anger',
        subtitle: 'Trauma Recovery Workbook',
        price: 17.99,
        pages: 134
      },
      'workbook-003': {
        name: 'Queer Healing: Beyond Binary Recovery',
        subtitle: 'Trauma Recovery Workbook',
        price: 21.99,
        pages: 178
      },
      'workbook-004': {
        name: 'Digital Sovereignty: Reclaiming Your Data Self',
        subtitle: 'Digital Wellness Workbook',
        price: 16.99,
        pages: 145
      },
      'workbook-005': {
        name: 'The Artist\'s Survival Guide: Creating Despite Capitalism',
        subtitle: 'Creative Recovery Workbook',
        price: 18.99,
        pages: 167
      },
      'workbook-006': {
        name: 'Collective Healing: Building Trauma-Informed Communities',
        subtitle: 'Community Healing Workbook',
        price: 22.99,
        pages: 189
      },
      'workbook-007': {
        name: 'Healing in the Ruins: Post-Collapse Recovery',
        subtitle: 'Crisis Recovery Workbook',
        price: 19.99,
        pages: 156
      },
      'workbook-008': {
        name: 'The Neurodivergent Healing Manual',
        subtitle: 'Neurodivergent-Affirming Workbook',
        price: 23.99,
        pages: 201
      },
      'workbook-009': {
        name: 'Love After Trauma: A Relationship Workbook',
        subtitle: 'Relationship Healing Workbook',
        price: 20.99,
        pages: 174
      }
    };

    const book = bookCatalog[bookId];
    if (!book) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid book ID' })
      };
    }

    // Validate price matches catalog
    if (price !== book.price) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Price mismatch' })
      };
    }

    // Calculate Jimmy's revenue (97% after Stripe fees)
    const stripeFee = (price * 0.029) + 0.30;
    const jimmyRevenue = price - stripeFee;

    // Create Stripe checkout session
    console.log('Creating Stripe session for:', book.name);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${book.name} - ${book.subtitle}`,
              description: `${book.pages} pages • ISBN-Free • DRM-Free EPUB Download`,
              metadata: {
                'book_id': bookId,
                'creator': 'Jimmy Thornburg',
                'platform': 'Fort Creator Liberation',
                'jimmy_revenue': jimmyRevenue.toFixed(2),
                'creator_sovereignty': 'true'
              }
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${event.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}&book_id=${bookId}`,
      cancel_url: `${event.headers.origin}/?cancelled=true`,
      metadata: {
        'book_id': bookId,
        'creator': 'Jimmy Thornburg',
        'jimmy_revenue': jimmyRevenue.toFixed(2)
      },
      // Enable automatic tax calculation if needed
      // automatic_tax: { enabled: true },
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: session.id,
        jimmyRevenue: jimmyRevenue.toFixed(2),
        stripeFee: stripeFee.toFixed(2),
        totalPrice: price.toFixed(2)
      })
    };

  } catch (error) {
    console.error('Stripe session creation failed:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Payment session creation failed',
        details: error.message
      })
    };
  }
};