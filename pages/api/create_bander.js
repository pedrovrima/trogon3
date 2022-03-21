import prisma from "../../lib/prisma";

export default async function dataBander(req, res) {
  const { bander_id, data } = JSON.parse(req.body);
  
  try {
    if (bander_id) {
      const banders = await prisma.BANDER_REGISTER.update({
        data: data,
        where: { bander_id},
      });
    } else {
      const banders = await prisma.BANDER_REGISTER.create({ data: data });
    }
    res.status(200).send();
  } catch (err) {
    if(err.code==="P2002"){
    res.status(406).send({error:"repeated_code"})}
  }
}
