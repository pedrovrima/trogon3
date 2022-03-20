// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import prisma from "lib/prisma";

export default async function (req, res) {
  const variables = await prisma.BANDER_REGISTER.findMany({
    select: {
      bander_id: true,
      name: true,
      code: true,
    },
  });
  res.send(variables);
}
