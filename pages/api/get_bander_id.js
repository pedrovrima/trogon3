// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import prisma from "../../lib/prisma";

export default async function (req, res) {
    const id =   (JSON.parse(req.body)).id;
    console.log(id)
    const variables = await prisma.BANDER_REGISTER.findUnique({
      where:{bander_id:id}
  });
  res.send(variables);
}
