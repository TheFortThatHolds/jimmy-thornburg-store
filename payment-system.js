/**
 * Jimmy's Sovereign Payment System
 * 100% Creator Revenue (minus payment processing)
 * No gatekeepers, no approval needed, no platform cuts
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs').promises;
const path = require('path');

class SovereignPaymentSystem {
    constructor() {
        this.bookCatalog = {
            'resonance-1': { price: 14.99, file: 'resonance_collective_1_the_signal.epub' },
            'resonance-2': { price: 14.99, file: 'resonance_collective_2_the_frequency.epub' },
            'resonance-3': { price: 14.99, file: 'resonance_collective_3_the_resonance.epub' },
            'gay-panic-001': { price: 12.99, file: 'gay_panic_at_the_disco.epub' },
            'space-opera-001': { price: 13.99, file: 'lovers_in_the_void.epub' },
            'workbook-001': { price: 19.99, file: 'body_holds_score_workbook.epub' },
            'workbook-002': { price: 17.99, file: 'rage_as_medicine_workbook.epub' },
            'workbook-003': { price: 21.99, file: 'queer_healing_workbook.epub' },
            'workbook-004': { price: 16.99, file: 'digital_sovereignty_workbook.epub' },
            'workbook-005': { price: 18.99, file: 'artists_survival_guide.epub' },
            'workbook-006': { price: 22.99, file: 'collective_healing_workbook.epub' },
            'workbook-007': { price: 19.99, file: 'healing_in_ruins_workbook.epub' },
            'workbook-008': { price: 23.99, file: 'neurodivergent_healing_manual.epub' },
            'workbook-009': { price: 20.99, file: 'love_after_trauma_workbook.epub' }
        };
    }

    /**
     * Step 1: Customer clicks "BUY NOW"
     * Create Stripe payment session
     */
    async createPaymentSession(bookId, customerEmail) {
        const book = this.bookCatalog[bookId];
        if (!book) throw new Error('Book not found');

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: customerEmail,
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Jimmy Thornburg - ${bookId}`,
                        description: 'DRM-free EPUB download - Sovereign creator, no gatekeepers'
                    },
                    unit_amount: Math.round(book.price * 100), // Stripe uses cents
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}&book=${bookId}`,
            cancel_url: `${process.env.DOMAIN}/store`,
            metadata: {
                book_id: bookId,
                creator: 'jimmy-thornburg',
                platform: 'sovereign-creator-store'
            }
        });

        return {
            sessionId: session.id,
            url: session.url,
            bookId: bookId,
            price: book.price
        };
    }

    /**
     * Step 2: Payment successful webhook
     * Stripe calls this when payment completes
     */
    async handlePaymentSuccess(session) {
        const bookId = session.metadata.book_id;
        const customerEmail = session.customer_details.email;
        const amountPaid = session.amount_total / 100; // Convert from cents

        // Generate secure download link
        const downloadToken = this.generateSecureToken();
        const downloadLink = `${process.env.DOMAIN}/download/${bookId}/${downloadToken}`;

        // Save purchase record
        await this.recordPurchase({
            bookId,
            customerEmail,
            amountPaid,
            downloadToken,
            timestamp: new Date().toISOString(),
            stripeSessionId: session.id
        });

        // Send download email to customer
        await this.sendDownloadEmail(customerEmail, bookId, downloadLink);

        // Calculate Jimmy's revenue (97%+ after Stripe fees)
        const stripeFee = (amountPaid * 0.029) + 0.30; // 2.9% + 30¢
        const jimmyRevenue = amountPaid - stripeFee;

        console.log(`💰 SALE COMPLETE: ${bookId} - $${amountPaid}`);
        console.log(`💸 Stripe fee: $${stripeFee.toFixed(2)}`);
        console.log(`🏦 Jimmy gets: $${jimmyRevenue.toFixed(2)} (${((jimmyRevenue/amountPaid)*100).toFixed(1)}%)`);

        return { success: true, revenue: jimmyRevenue };
    }

    /**
     * Step 3: Secure file delivery
     * Customer clicks download link from email
     */
    async deliverFile(bookId, downloadToken) {
        // Verify token is valid and not expired
        const purchase = await this.validateDownloadToken(bookId, downloadToken);
        if (!purchase) {
            throw new Error('Invalid or expired download link');
        }

        // Get file path
        const book = this.bookCatalog[bookId];
        const filePath = path.join(__dirname, 'books', book.file);

        // Check if file exists
        try {
            await fs.access(filePath);
        } catch {
            throw new Error('Book file not found');
        }

        // Return file for download
        return {
            filePath,
            filename: book.file,
            contentType: 'application/epub+zip'
        };
    }

    /**
     * Generate secure download token
     * Valid for 7 days, single-use per customer
     */
    generateSecureToken() {
        return require('crypto').randomBytes(32).toString('hex');
    }

    /**
     * Record purchase in local database
     * No corporate surveillance, just basic sales tracking
     */
    async recordPurchase(purchase) {
        const salesFile = path.join(__dirname, 'sales', 'purchases.json');
        
        try {
            const existing = JSON.parse(await fs.readFile(salesFile, 'utf8'));
            existing.push(purchase);
            await fs.writeFile(salesFile, JSON.stringify(existing, null, 2));
        } catch {
            // Create new sales file if doesn't exist
            await fs.mkdir(path.dirname(salesFile), { recursive: true });
            await fs.writeFile(salesFile, JSON.stringify([purchase], null, 2));
        }
    }

    /**
     * Validate download token
     * Ensure customer can only download what they paid for
     */
    async validateDownloadToken(bookId, token) {
        const salesFile = path.join(__dirname, 'sales', 'purchases.json');
        
        try {
            const purchases = JSON.parse(await fs.readFile(salesFile, 'utf8'));
            const purchase = purchases.find(p => 
                p.bookId === bookId && 
                p.downloadToken === token &&
                !p.downloaded && // Single-use token
                new Date(p.timestamp) > new Date(Date.now() - 7*24*60*60*1000) // 7 days
            );

            if (purchase) {
                // Mark as downloaded
                purchase.downloaded = true;
                purchase.downloadedAt = new Date().toISOString();
                await fs.writeFile(salesFile, JSON.stringify(purchases, null, 2));
                return purchase;
            }
        } catch {
            return null;
        }
        
        return null;
    }

    /**
     * Send download email to customer
     * Simple, no marketing bullshit
     */
    async sendDownloadEmail(email, bookId, downloadLink) {
        const emailContent = `
Subject: Your book download from Jimmy Thornburg

Thanks for supporting sovereign creators! Here's your DRM-free EPUB:

Download link: ${downloadLink}
(Valid for 7 days)

Your purchase supports:
• 97%+ revenue to the creator (not corporate platforms)
• ISBN-free publishing revolution  
• Trauma-informed content creation
• Community health resources (always free)

Questions? Reply to this email.

The Fort holds,
Jimmy Thornburg
        `;

        // In production, use actual email service (SendGrid, etc)
        console.log(`📧 SENDING EMAIL TO: ${email}`);
        console.log(emailContent);
        
        // TODO: Integrate actual email service
        // await emailService.send(email, emailContent);
    }

    /**
     * Get sales dashboard for Jimmy
     * Track revenue without corporate surveillance
     */
    async getSalesDashboard() {
        const salesFile = path.join(__dirname, 'sales', 'purchases.json');
        
        try {
            const purchases = JSON.parse(await fs.readFile(salesFile, 'utf8'));
            
            const totalSales = purchases.length;
            const totalRevenue = purchases.reduce((sum, p) => sum + p.amountPaid, 0);
            const avgStripeFee = 0.029 * totalRevenue + (0.30 * totalSales);
            const jimmyRevenue = totalRevenue - avgStripeFee;

            const bookSales = {};
            purchases.forEach(p => {
                if (!bookSales[p.bookId]) bookSales[p.bookId] = 0;
                bookSales[p.bookId]++;
            });

            return {
                totalSales,
                totalRevenue,
                jimmyRevenue,
                revenuePercentage: ((jimmyRevenue / totalRevenue) * 100).toFixed(1),
                bookSales,
                averageOrderValue: (totalRevenue / totalSales).toFixed(2)
            };
        } catch {
            return { totalSales: 0, totalRevenue: 0, jimmyRevenue: 0 };
        }
    }
}

module.exports = SovereignPaymentSystem;