import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { createUserWebhook } from "@/database/actions/user";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

export async function POST(req: Request) {
    console.log("----------------------------------------");
    console.log("[WEBHOOK] Incoming POST request detected.");
    console.log("----------------------------------------");

    if (!WEBHOOK_SECRET) {
        console.error("[WEBHOOK CONFIG ERROR]: WEBHOOK_SECRET is missing from environment variables.");
        return new NextResponse('Please add WEBHOOK_SECRET from your dashboard to .env', { status: 500 });
    }

    // 1. Log Headers
    const headerPayload = req.headers;
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    console.log("[WEBHOOK HEADERS RECEIVED]:", { svix_id, svix_timestamp, svix_signature });

    if (!svix_id || !svix_timestamp || !svix_signature) {
        console.warn("[WEBHOOK VALIDATION FAILED]: Missing required svix headers.");
        return new NextResponse('Error occured -- no svix headers', { status: 400 });
    }

    // 2. Parse and log raw body payload
    let payload: any;
    let body: string;
    try {
        payload = await req.json();
        body = JSON.stringify(payload);
        console.log("[WEBHOOK RAW BODY PARSED SUCCESSFUL]");
    } catch (parseError) {
        console.error("[WEBHOOK PARSE ERROR]: Failed to parse request JSON:", parseError);
        return new NextResponse('Invalid JSON payload', { status: 400 });
    }

    // 3. Signature Verification Layer
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: any;

    try {
        console.log("[VERIFICATION] Attempting Svix cryptographic handshake...");
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        });
        console.log("[VERIFICATION SUCCESS] Signature verified. Event type authenticated:", evt.type);
    } catch (err) {
        console.error('[VERIFICATION FAILED]: Svix verification rejected the headers/body alignment.', err);
        return new NextResponse('Error occured', { status: 400 });
    }

    const eventType = evt.type;

    // 4. Trace the database insert pipeline
    if (eventType === 'user.created' || eventType === 'session.created') {
        const { id, email_addresses, first_name, last_name } = evt.data;
        const email = email_addresses?.[0]?.email_address || '';
        const name = `${first_name || ''} ${last_name || ''}`.trim();

        console.log("[PAYLOAD DATA EXTRACTION]:", {
            clerk_id: id,
            full_name: name,
            email: email,
            eventType: eventType
        });

        try {
            console.log("[DB OPERATION] Forwarding extracted fields to Drizzle action `createUserWebhook`...");
            const user = await createUserWebhook({
                clerk_id: id,
                full_name: name,
                email: email,
                tier: "free"
            });

            console.log("[DB OPERATION SUCCESS] Row committed successfully. Action returned:", user);
            return NextResponse.json({ message: 'User synced successfully', user: user }, { status: 200 });
        } catch (dbError) {
            console.error('[DB OPERATION FAILED] Critical failure down inside the Neon/Drizzle layer:', dbError);
            return new NextResponse('Database insertion failed', { status: 500 });
        }
    }

    console.warn(`[WEBHOOK EVENT SKIPPED] Received event "${eventType}" which does not trigger user sync.`);
    return NextResponse.json({ message: 'Event ignored' }, { status: 200 });
}   