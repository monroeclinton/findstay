import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { env } from "~/env.mjs";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { stripe } from "~/server/stripe";

export const invoiceRouter = createTRPCRouter({
    create: publicProcedure
        .input(
            z.object({
                email: z.string().email(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const invoices = await ctx.prisma.invoice.count({
                where: {
                    paid: true,
                    email: input.email,
                },
            });

            if (invoices > 0)
                throw new TRPCError({
                    code: "CONFLICT",
                    message:
                        "This email has already been used to purchase FindStay, try to sign in.",
                });

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                customer_email: input.email,
                line_items: [
                    {
                        price: env.STRIPE_PRICE_ID,
                        quantity: 1,
                    },
                ],
                mode: "payment",
                success_url: env.STRIPE_SUCCESS_URL,
                cancel_url: env.STRIPE_CANCEL_URL,
            });

            if (!session.url)
                throw new Error(`${session.id} - No url generated`);

            return {
                url: session.url,
            };
        }),
});
