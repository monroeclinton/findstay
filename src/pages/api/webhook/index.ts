import { buffer } from "micro";
import { type NextApiRequest } from "next";
import { NextResponse } from "next/server";
import type { Stripe } from "stripe";

import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { stripe } from "~/server/stripe";

const handler = async (req: NextApiRequest) => {
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
        return NextResponse.json(
            { message: `Webhook Error: ${errorMessage}` },
            { status: 400 }
        );
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

                    if (data.invoice) {
                        if (data.customer_email) {
                            await prisma.invoice.create({
                                data: {
                                    email: data.customer_email,
                                    paid: true,
                                    txId: data.invoice.toString(),
                                },
                            });
                        } else {
                            console.log(`❌ No customer email: ${data.id}`);
                        }
                    } else {
                        console.log(`❌ No invoice: ${data.id}`);
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
            return NextResponse.json(
                { message: "Webhook handler failed" },
                { status: 500 }
            );
        }
    }
    // Return a response to acknowledge receipt of the event.
    return NextResponse.json({ message: "Received" }, { status: 200 });
};

export default handler;
