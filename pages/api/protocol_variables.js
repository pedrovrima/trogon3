// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function (req, res) {
  const {protocol_id} = req
  const variables = await prisma.PROTOCOL_VARS.findMany({where: {protocol_id}, include:{capture_variable_register:{include:{capture_categorical_options:true}}}})
  res.send(variables)
}
 