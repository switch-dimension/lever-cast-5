import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { Webhook } from 'svix';
import { UserService } from '@/services/user.service';

export async function POST(req: Request) {
    // Get the headers
    const headersList = await headers();
    const svix_id = headersList.get('svix-id');
    const svix_timestamp = headersList.get('svix-timestamp');
    const svix_signature = headersList.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occured -- no svix headers', {
            status: 400,
        });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(process.env.WEBHOOK_SECRET || '');

    let evt: WebhookEvent;

    // Verify the webhook
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return new Response('Error occured', {
            status: 400,
        });
    }

    // Handle the webhook
    const eventType = evt.type;

    if (eventType === 'user.created') {
        const { id, email_addresses, first_name, last_name } = evt.data;
        const primaryEmail = email_addresses[0]?.email_address;

        if (!primaryEmail) {
            return new Response('No email address found', { status: 400 });
        }

        try {
            const name = [first_name, last_name].filter(Boolean).join(' ');
            await UserService.createUser({
                clerkId: id,
                email: primaryEmail,
                name: name || null,
            });

            return new Response('User created', { status: 201 });
        } catch (error) {
            console.error('Error creating user:', error);
            return new Response('Error creating user', { status: 500 });
        }
    }

    return new Response('Webhook received', { status: 200 });
} 