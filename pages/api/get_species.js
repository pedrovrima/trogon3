// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import prisma from "lib/prisma";

export default async function (req, res) {
  const variables = await prisma.SPP_REGISTER.findMany({
    select: {
      spp_id: true,
      genus: true,
      species: true,
      pt_name: true,
      sci_code: true,
    },
  });
  res.send(variables);
}
