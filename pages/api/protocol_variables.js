// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import prisma from 'lib/prisma'


export default async function (req, res) {
  const {protocol_id} = req
  const variables = await prisma.PROTOCOL_VARS.findMany({where: {protocol_id}, include:{capture_variable_register:{include:{capture_categorical_options:true}}}})
  res.send(variables)
}
 