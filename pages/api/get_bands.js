// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import prisma from "lib/prisma";

export default async function (req, res) {
  const variables = await prisma.BAND_STRING_REGISTER.findMany({
    include: {
      bands: true,
    },
  });
  res.send(variables);
}
