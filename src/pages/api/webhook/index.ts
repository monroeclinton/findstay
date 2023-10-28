import { buffer } from "micro";
import { type NextApiRequest, type NextApiResponse } from "next";
import { NextResponse } from "next/server";
import type { Stripe } from "stripe";

import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { stripe } from "~/server/stripe";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    let event: Stripe.Event;

    try {
        const buf = await buffer(req);

        event = stripe.webhooks.constructEvent(
            buf,
            req.headers["stripe-signature"] as string,
            env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        const errorMessage =
            err instanceof Error ? err.message : "Unknown error";
        // On error, log and return the error message.
        if (err instanceof Error) console.log(err);
        console.log(`❌ Error message: ${errorMessage}`);
        res.status(400).json({ message: `Webhook Error: ${errorMessage}` });
        return;
    }

    // Successfully constructed event.
    console.log("✅ Success:", event.id);

    const permittedEvents: string[] = [
        "checkout.session.completed",
        "payment_intent.payment_failed",
    ];

    if (permittedEvents.includes(event.type)) {
        let data;

        try {
            switch (event.type) {
                case "checkout.session.completed":
                    data = event.data.object;

                    if (data.customer_email) {
                        await prisma.invoice.create({
                            data: {
                                email: data.customer_email,
                                paid: true,
                                txId: data.id,
                            },
                        });
                    } else {
                        console.log(`❌ No customer email: ${data.id}`);
                    }

                    break;
                case "payment_intent.payment_failed":
                    data = event.data.object;
                    if (data.last_payment_error?.message) {
                        console.log(
                            `❌ Payment failed: ${data.id} - ${data.last_payment_error.message}`
                        );
                    } else {
                        console.log(`❌ Payment failed: ${data.id}`);
                    }
                    break;
                default:
                    throw new Error(`Unhandled event: ${event.type}`);
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Webhook handler failed" });
            return;
        }
    }

    // Return a response to acknowledge receipt of the event.
    res.status(200).json({ message: "Received" });
};

export const config = {
    api: {
        bodyParser: false,
    },
};

export default handler;
