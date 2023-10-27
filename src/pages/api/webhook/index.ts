import { NextResponse } from "next/server";
import type { Stripe } from "stripe";

import { prisma } from "~/server/db";
import { stripe } from "~/server/stripe";

export async function POST(req: Request) {
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            await (await req.blob()).text(),
            req.headers.get("stripe-signature") as string,
            process.env.STRIPE_WEBHOOK_SECRET as string
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
                        await prisma.invoice.update({
                            where: {
                                txId: data.invoice.toString(),
                            },
                            data: {
                                paid: true,
                            },
                        });
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
}
