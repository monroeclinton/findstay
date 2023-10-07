import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
    delete: protectedProcedure.mutation(async ({ ctx }) => {
        const session = ctx.session;

        return ctx.prisma.user.delete({
            where: { id: session.user.id },
        });
    }),
    update: protectedProcedure
        .input(
            z.object({
                name: z.string().max(30),
                email: z.string().email(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const session = ctx.session;

            return ctx.prisma.user.update({
                where: { id: session.user.id },
                data: {
                    name: input.name,
                    email: input.email,
                },
            });
        }),
});
