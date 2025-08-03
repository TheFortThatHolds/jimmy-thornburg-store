/**
 * Domain Configuration for thefortthatholds.xyz
 * Jimmy's Sovereign Creator Commerce Platform
 */

const domainConfig = {
    // Main commerce domain
    primaryDomain: "thefortthatholds.xyz",
    
    // Store structure
    subdomains: {
        "books": "Book catalog and creator stores",
        "jimmy": "Jimmy Thornburg's personal store", 
        "creators": "Creator directory and marketplace",
        "api": "Payment and download API",
        "cdn": "File delivery and EPUB hosting"
    },
    
    // URL structure for Jimmy's store
    urls: {
        store: "https://jimmy.thefortthatholds.xyz",
        catalog: "https://books.thefortthatholds.xyz/jimmy",
        api: "https://api.thefortthatholds.xyz/jimmy",
        downloads: "https://cdn.thefortthatholds.xyz/jimmy/books"
    },
    
    // Stripe configuration
    stripe: {
        // Get these from Stripe dashboard
        publishableKey: "pk_live_...", // Your publishable key
        webhookSecret: "whsec_...", // Webhook signing secret
        successUrl: "https://jimmy.thefortthatholds.xyz/success",
        cancelUrl: "https://jimmy.thefortthatholds.xyz/store"
    },
    
    // Email configuration  
    email: {
        from: "books@thefortthatholds.xyz",
        replyTo: "jimmy@thefortthatholds.xyz",
        subject: "Your DRM-free book download from Jimmy Thornburg"
    },
    
    // File delivery
    books: {
        storageType: "local", // or "s3", "cdn"
        basePath: "/var/www/books/jimmy/",
        downloadDomain: "https://cdn.thefortthatholds.xyz"
    }
};

// Environment-specific configs
const environments = {
    development: {
        domain: "localhost:3000",
        stripe: {
            publishableKey: "pk_test_...", // Test key
            secretKey: "sk_test_..." // Test secret
        }
    },
    
    production: {
        domain: "thefortthatholds.xyz",
        stripe: {
            publishableKey: "pk_live_...", // Live key
            secretKey: "sk_live_..." // Live secret
        }
    }
};

module.exports = { domainConfig, environments };